import { supabase } from '../lib/supabase'

const LOCAL_STORAGE_KEY = 'cyprus_visa_applications_mirror'

// Helper for local mirror storage
const getLocalApplications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalApplications = (apps) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps))
  } catch {}
}

/**
 * Helper to upload individual document to Supabase Storage bucket 'visa-documents'
 */
export async function uploadDocumentToStorage(file, referenceNumber, docKey) {
  if (!file || typeof file === 'string') return null
  try {
    const fileExt = file.name.split('.').pop()
    const safeFileName = `${referenceNumber}/${docKey}_${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('visa-documents')
      .upload(safeFileName, file, {
        cacheControl: '3600',
        upsert: true
      })
      
    if (error) {
      console.warn(`Supabase Storage note for ${docKey}:`, error.message)
      return null
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('visa-documents')
      .getPublicUrl(data.path)
      
    return {
      path: data.path,
      url: publicUrlData?.publicUrl || '',
      name: file.name,
      size: file.size,
      type: file.type
    }
  } catch (err) {
    console.warn('Storage upload note:', err)
    return null
  }
}

/**
 * Submit a new visa application to Supabase (with automatic local backup sync & document storage)
 */
export async function submitVisaApplication(data, rawFiles = {}) {
  const referenceNumber = `B21-${Math.floor(10000 + Math.random() * 90000)}`
  
  // Upload real files to Supabase Storage if available
  const docsData = {
    passport: data.passportFile || null,
    photo: data.photoFile || null,
    insurance: data.insuranceFile || null,
    bankStatement: data.bankStatementFile || null,
    accommodation: data.hotelFile || null,
    flight: data.flightFile || null,
    coverLetter: data.coverLetterFile || null,
    additional: data.additionalFile || null,
  }

  // If raw file objects are provided, upload them asynchronously
  if (rawFiles && Object.keys(rawFiles).length > 0) {
    await Promise.all(
      Object.entries(rawFiles).map(async ([key, fileObj]) => {
        if (fileObj instanceof File || fileObj instanceof Blob) {
          const uploaded = await uploadDocumentToStorage(fileObj, referenceNumber, key)
          if (uploaded?.url) {
            docsData[key] = {
              name: fileObj.name,
              url: uploaded.url,
              path: uploaded.path,
              size: fileObj.size,
              type: fileObj.type
            }
          }
        }
      })
    )
  }

  const applicationRecord = {
    reference_number: referenceNumber,
    user_id: data.user_id || null,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone || '',
    nationality: data.nationality || '',
    place_of_birth: data.placeOfBirth || '',
    passport: data.passport,
    passport_expiry: data.passportExpiry || '',
    dob: data.dob || '',
    gender: data.gender || 'male',
    marital_status: data.maritalStatus || '',
    address: data.address || '',
    city: data.city || '',
    postal_code: data.postalCode || '',
    country_of_residence: data.countryOfResidence || '',
    emergency_name: data.emergencyName || '',
    emergency_phone: data.emergencyPhone || '',
    visa_type: data.visaType || 'tourist',
    arrival: data.arrival || '',
    return_date: data.returnDate || '',
    destination_address: data.destinationAddress || '',
    host_name: data.hostName || '',
    host_phone: data.hostPhone || '',
    nights: String(data.nights || '7'),
    purpose: data.purpose || '',
    documents: docsData,
    status: 'Pending',
    admin_notes: 'Application received and queued for review.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Always keep local backup copy
  const localList = getLocalApplications()
  saveLocalApplications([applicationRecord, ...localList])

  try {
    const { data: inserted, error } = await supabase
      .from('visa_applications')
      .insert([applicationRecord])
      .select()
      .single()

    if (error) {
      console.warn('Supabase insert note (table may need creation or RLS):', error.message)
      return { success: true, data: applicationRecord, fromSupabase: false, note: error.message }
    }

    return { success: true, data: inserted, fromSupabase: true }
  } catch (err) {
    console.warn('Network / Supabase error on submit:', err)
    return { success: true, data: applicationRecord, fromSupabase: false, error: err.message }
  }
}

/**
 * Check application status by reference number and optionally passport/dob
 */
export async function checkVisaStatus(referenceNumber, passport = '') {
  const refClean = referenceNumber.trim().toUpperCase()
  const passClean = passport.trim().toUpperCase()

  try {
    let query = supabase
      .from('visa_applications')
      .select('*')
      .ilike('reference_number', refClean)

    if (passClean) {
      query = query.ilike('passport', passClean)
    }

    const { data, error } = await query.maybeSingle()

    if (!error && data) {
      return { found: true, application: data, source: 'supabase' }
    }
  } catch (err) {
    console.warn('Supabase lookup error:', err)
  }

  // Fallback to local storage
  const localList = getLocalApplications()
  const localMatch = localList.find(
    (app) => app.reference_number.toUpperCase() === refClean &&
      (!passClean || app.passport.toUpperCase() === passClean)
  )

  if (localMatch) {
    return { found: true, application: localMatch, source: 'local' }
  }

  // Check demo references like CY-10001, CY-10002, CY-10003
  if (/^CY-\d{5}$/.test(refClean)) {
    const seed = [...refClean].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    const status = ['Pending', 'Approved', 'Rejected'][seed % 3]
    const messages = {
      Pending: 'Your documents are with a case officer. No action is needed from you right now.',
      Approved: 'A decision has been published. Collect your visa with your passport and this reference.',
      Rejected: 'The application was refused. The refusal letter explains which requirement was not met.'
    }
    return {
      found: true,
      application: {
        reference_number: refClean,
        full_name: 'Sample Applicant',
        passport: passClean || 'AB1234567',
        status,
        visa_type: ['tourist', 'business', 'student'][seed % 3],
        admin_notes: messages[status],
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      source: 'demo'
    }
  }

  return { found: false }
}

/**
 * Fetch all visa applications for Admin Panel
 */
export async function getAllApplications() {
  try {
    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      return { applications: data, source: 'supabase' }
    }
  } catch (err) {
    console.warn('Supabase fetch all error:', err)
  }

  // Fallback or merge with local mirror
  const localList = getLocalApplications()
  return { applications: localList, source: 'local' }
}

/**
 * Update application status and admin notes
 */
export async function updateApplicationStatus(idOrRef, status, adminNotes = '') {
  const localList = getLocalApplications()
  const updatedList = localList.map((app) => {
    if (app.id === idOrRef || app.reference_number === idOrRef) {
      return { ...app, status, admin_notes: adminNotes || app.admin_notes, updated_at: new Date().toISOString() }
    }
    return app
  })
  saveLocalApplications(updatedList)

  try {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrRef)
    const query = supabase
      .from('visa_applications')
      .update({
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })

    const { data, error } = isUuid
      ? await query.eq('id', idOrRef).select().single()
      : await query.eq('reference_number', idOrRef).select().single()

    if (!error) {
      return { success: true, data, fromSupabase: true }
    }
  } catch (err) {
    console.warn('Supabase update status error:', err)
  }

  return { success: true, fromSupabase: false }
}

/**
 * Delete application
 */
export async function deleteApplication(idOrRef) {
  const localList = getLocalApplications()
  const filtered = localList.filter((app) => app.id !== idOrRef && app.reference_number !== idOrRef)
  saveLocalApplications(filtered)

  try {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrRef)
    const query = supabase.from('visa_applications').delete()
    if (isUuid) {
      await query.eq('id', idOrRef)
    } else {
      await query.eq('reference_number', idOrRef)
    }
  } catch (err) {
    console.warn('Supabase delete error:', err)
  }

  return { success: true }
}
