import { supabase } from '../lib/supabase'

// Storage key for local mirror
const LOCAL_STORAGE_KEY = 'cyprus_visa_applications_mirror'

// Helper for local mirror storage
export const getLocalApplications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Filter out any legacy dummy demo records if present
        const cleaned = parsed.filter(
          (app) =>
            app &&
            app.id &&
            !String(app.id).startsWith('demo-') &&
            app.reference_number !== '7209572' &&
            app.passport !== 'PA3726025' &&
            app.full_name !== 'DHANANJAYA RAI'
        )
        if (cleaned.length !== parsed.length) {
          saveLocalApplications(cleaned)
        }
        return cleaned
      }
    }
  } catch (e) {}

  return []
}

export const saveLocalApplications = (apps) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps))
  } catch (e) {
    console.warn('Local storage write warning:', e)
  }
}

/**
 * Helper to upload individual document to Supabase Storage bucket 'visa-documents'
 */
export async function uploadDocumentToStorage(file, referenceNumber, docKey) {
  if (!file || typeof file === 'string') return null
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'pdf'
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
 * Get all visa applications (merged from Supabase & Local Cache)
 */
export async function getAllApplications() {
  const localList = getLocalApplications()
  let supabaseApps = []
  let hasSupabase = false

  try {
    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data) && data.length > 0) {
      supabaseApps = data
      hasSupabase = true
    }
  } catch (e) {
    console.warn('Supabase fetch note:', e)
  }

  // Merge list avoiding duplicates (keyed by reference_number or passport)
  const map = new Map()

  // First put localList
  localList.forEach((app) => {
    const key = app.reference_number || app.id || app.passport
    if (key) map.set(key, app)
  })

  // Then overlay supabaseApps
  supabaseApps.forEach((app) => {
    const key = app.reference_number || app.id || app.passport
    if (key) {
      const existing = map.get(key)
      map.set(key, { ...existing, ...app })
    }
  })

  const merged = Array.from(map.values())
  saveLocalApplications(merged)

  return {
    applications: merged,
    source: hasSupabase ? 'supabase' : 'local'
  }
}

// Helper for readable date formatting (e.g. "19 Sept 2026" or "25 Aug 2001")
export function formatDisplayDate(dateVal) {
  if (!dateVal) return ''
  try {
    const trimmed = String(dateVal).trim()
    // If it's already in "DD Mon YYYY" or "DD Month YYYY" format, return it
    if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
      return trimmed
    }
    // Try parsing dd/mm/yyyy or dd-mm-yyyy
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1], 10)
      const month = parseInt(ddmmyyyy[2], 10) - 1
      const year = parseInt(ddmmyyyy[3], 10)
      const parsed = new Date(year, month, day)
      if (!isNaN(parsed.getTime())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        return `${String(parsed.getDate()).padStart(2, '0')} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`
      }
    }
    const d = new Date(dateVal)
    if (!isNaN(d.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
    }
    return trimmed
  } catch (e) {
    return String(dateVal)
  }
}

// Normalize dates for flexible matching across formats (YYYY-MM-DD vs DD/MM/YYYY vs DD Mon YYYY)
export function normalizeDateForComparison(str) {
  if (!str) return ''
  const trimmed = String(str).trim().toLowerCase()
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${String(ddmmyyyy[2]).padStart(2, '0')}-${String(ddmmyyyy[1]).padStart(2, '0')}`
  }
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return trimmed.replace(/[^a-z0-9]/g, '')
}

/**
 * Submit a new visa application to Supabase (with automatic local backup sync & document storage)
 */
export async function submitVisaApplication(data, rawFiles = {}) {
  const referenceNumber = `B21-${Math.floor(10000 + Math.random() * 90000)}`
  const visaNumber = `E26-${Math.floor(100000 + Math.random() * 900000)}`
  
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

  const now = new Date()
  const submittedFormatted = formatDisplayDate(now)
  const dobFormatted = data.dob ? formatDisplayDate(data.dob) : ''

  const visaTypeMap = {
    tourist: 'Tourist Visa',
    business: 'Business Visa',
    work: 'Work Permit',
    student: 'Student Visa',
    transit: 'Transit Visa'
  }
  const displayVisaType = visaTypeMap[data.visaType] || data.visaType || 'Tourist Visa'
  const displayEntries = data.entries || (data.visaType === 'work' ? 'Multiple' : 'Single')
  const displayDuration = data.duration || (data.nights ? `${data.nights} days` : '90 days')
  const displayPort = data.portOfEntry || 'Larnaca International Airport'

  const passportClean = data.passport ? String(data.passport).trim().toUpperCase() : ''
  const fullNameClean = (data.fullName || data.full_name || '').trim()

  const applicationRecord = {
    id: `app-${Date.now()}`,
    reference_number: referenceNumber,
    visa_number: visaNumber,
    user_id: data.user_id || null,
    full_name: fullNameClean,
    email: (data.email || '').trim(),
    phone: data.phone || '',
    nationality: (data.nationality || '').trim(),
    place_of_birth: data.placeOfBirth || data.place_of_birth || '',
    passport: passportClean,
    passport_expiry: data.passportExpiry || data.passport_expiry || '',
    dob: dobFormatted || data.dob || '',
    gender: data.gender || 'male',
    marital_status: data.maritalStatus || data.marital_status || '',
    address: data.address || '',
    city: data.city || '',
    postal_code: data.postalCode || data.postal_code || '',
    country_of_residence: data.countryOfResidence || data.country_of_residence || '',
    emergency_name: data.emergencyName || data.emergency_name || '',
    emergency_phone: data.emergencyPhone || data.emergency_phone || '',
    visa_type: displayVisaType,
    entries: displayEntries,
    duration: displayDuration,
    port_of_entry: displayPort,
    arrival: data.arrival || '',
    return_date: data.returnDate || data.return_date || '',
    destination_address: data.destinationAddress || data.destination_address || '',
    host_name: data.hostName || data.host_name || '',
    host_phone: data.hostPhone || data.host_phone || '',
    nights: String(data.nights || '7'),
    purpose: data.purpose || '',
    documents: docsData,
    submitted_date: submittedFormatted,
    decision_date: 'Pending',
    issue_date: 'Pending',
    expiry_date: '',
    status: 'Pending',
    admin_notes: 'Application received and queued for official review.',
    decision_pdf: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  }

  const localList = getLocalApplications()
  saveLocalApplications([applicationRecord, ...localList])

  // Direct fast lookup cache
  if (passportClean) {
    try {
      localStorage.setItem(`cyprus_visa_app_${passportClean}`, JSON.stringify(applicationRecord))
    } catch (e) {}
  }
  try {
    localStorage.setItem(`cyprus_visa_app_${referenceNumber.toUpperCase()}`, JSON.stringify(applicationRecord))
    sessionStorage.setItem('current_visa_result', JSON.stringify(applicationRecord))
  } catch (e) {}

  try {
    const { data: inserted, error } = await supabase
      .from('visa_applications')
      .insert([applicationRecord])
      .select()
      .single()

    if (error) {
      console.warn('Supabase insert note:', error.message)
      return { success: true, data: applicationRecord, fromSupabase: false, note: error.message }
    }

    return { success: true, data: inserted, fromSupabase: true }
  } catch (err) {
    console.warn('Network / Supabase error on submit:', err)
    return { success: true, data: applicationRecord, fromSupabase: false, error: err.message }
  }
}

/**
 * Update full application details (All fields + Decision PDF)
 */
export async function updateFullApplication(idOrRef, fields = {}) {
  const localList = getLocalApplications()
  let targetApp = null
  const cleanId = String(idOrRef).toUpperCase()

  const updatedList = localList.map((app) => {
    const matchId = app.id && String(app.id).toUpperCase() === cleanId
    const matchRef = app.reference_number && String(app.reference_number).toUpperCase() === cleanId
    const matchPass = app.passport && String(app.passport).toUpperCase() === cleanId

    if (matchId || matchRef || matchPass) {
      targetApp = {
        ...app,
        ...fields,
        updated_at: new Date().toISOString()
      }
      return targetApp
    }
    return app
  })

  if (!targetApp) {
    targetApp = {
      reference_number: cleanId.startsWith('CY-') || cleanId.startsWith('B21-') ? cleanId : `CY-${Math.floor(10000 + Math.random() * 90000)}`,
      passport: fields.passport ? fields.passport.toUpperCase() : cleanId,
      ...fields,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    updatedList.unshift(targetApp)
  }

  saveLocalApplications(updatedList)

  // Direct fast lookup caching
  if (targetApp.passport) {
    try {
      localStorage.setItem(`cyprus_visa_app_${targetApp.passport.toUpperCase()}`, JSON.stringify(targetApp))
    } catch (e) {}
  }
  if (targetApp.reference_number) {
    try {
      localStorage.setItem(`cyprus_visa_app_${targetApp.reference_number.toUpperCase()}`, JSON.stringify(targetApp))
    } catch (e) {}
  }

  // Update current session result cache as well
  try {
    sessionStorage.setItem('current_visa_result', JSON.stringify(targetApp))
  } catch (e) {}

  // Sync to Supabase
  try {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrRef)
    const payload = {
      full_name: targetApp.full_name,
      passport: targetApp.passport,
      dob: targetApp.dob,
      nationality: targetApp.nationality,
      visa_type: targetApp.visa_type,
      status: targetApp.status,
      admin_notes: targetApp.admin_notes,
      updated_at: new Date().toISOString()
    }

    if (targetApp.decision_pdf !== undefined) {
      payload.decision_pdf = targetApp.decision_pdf
    }

    const query = supabase.from('visa_applications')
    const { data, error } = isUuid
      ? await query.update(payload).eq('id', idOrRef).select().single()
      : await query.update(payload).eq('reference_number', targetApp.reference_number).select().single()

    if (!error && data) {
      return { success: true, data, fromSupabase: true }
    }
  } catch (err) {
    console.warn('Supabase update note:', err)
  }

  return { success: true, data: targetApp, fromSupabase: false }
}

/**
 * Check application status by passport number, date of birth, or reference number
 */
export async function checkVisaStatus(passportOrRef, dob = '', refNum = '') {
  const queryTerm = (passportOrRef || refNum || '').trim().toUpperCase()
  const dobClean = (dob || '').trim()

  if (!queryTerm) return { found: false }

  const normalizedInputDob = dobClean ? normalizeDateForComparison(dobClean) : ''

  const matchesDob = (app) => {
    if (!normalizedInputDob || !app.dob) return true
    const normalizedAppDob = normalizeDateForComparison(app.dob)
    return (
      normalizedAppDob === normalizedInputDob ||
      app.dob.toLowerCase().includes(dobClean.toLowerCase()) ||
      dobClean.toLowerCase().includes(app.dob.toLowerCase())
    )
  }

  // 1. Check direct local key cache
  try {
    const cached = localStorage.getItem(`cyprus_visa_app_${queryTerm}`)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && matchesDob(parsed)) {
        return { found: true, application: parsed, source: 'local-cache' }
      }
    }
  } catch (e) {}

  // 2. Check local storage mirror
  const localList = getLocalApplications()
  const localMatch = localList.find((app) => {
    const passMatch = app.passport && app.passport.toUpperCase() === queryTerm
    const refMatch = app.reference_number && app.reference_number.toUpperCase() === queryTerm
    const visaMatch = app.visa_number && app.visa_number.toUpperCase() === queryTerm
    return (passMatch || refMatch || visaMatch) && matchesDob(app)
  })

  if (localMatch) {
    return { found: true, application: localMatch, source: 'local' }
  }

  // Also check without DOB restriction if exact reference/passport matched
  const looseLocalMatch = localList.find((app) => {
    const passMatch = app.passport && app.passport.toUpperCase() === queryTerm
    const refMatch = app.reference_number && app.reference_number.toUpperCase() === queryTerm
    const visaMatch = app.visa_number && app.visa_number.toUpperCase() === queryTerm
    return passMatch || refMatch || visaMatch
  })

  if (looseLocalMatch) {
    return { found: true, application: looseLocalMatch, source: 'local' }
  }

  // 3. Try matching in Supabase
  try {
    let query = supabase.from('visa_applications').select('*')
    if (queryTerm.startsWith('CY-') || queryTerm.startsWith('B21-')) {
      query = query.ilike('reference_number', queryTerm)
    } else {
      query = query.ilike('passport', queryTerm)
    }

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return { found: true, application: data, source: 'supabase' }
    }
  } catch (err) {
    console.warn('Supabase lookup error:', err)
  }

  return { found: false }
}

/**
 * Update application status, admin notes, and optional decision PDF
 */
export async function updateApplicationStatus(idOrRef, status, adminNotes = '', decisionPdf = undefined) {
  return updateFullApplication(idOrRef, {
    ...(status !== undefined ? { status } : {}),
    ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    ...(decisionPdf !== undefined ? { decision_pdf: decisionPdf } : {})
  })
}

/**
 * Upload official decision PDF file
 */
export async function uploadDecisionPdf(file, referenceNumber) {
  if (!file) return null

  const toBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(f)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  let base64Url = ''
  try {
    base64Url = await toBase64(file)
  } catch (e) {}

  let storageUrl = ''
  try {
    const uploaded = await uploadDocumentToStorage(file, referenceNumber, 'decision_pdf')
    if (uploaded?.url) {
      storageUrl = uploaded.url
    }
  } catch (err) {}

  const pdfRecord = {
    name: file.name,
    url: storageUrl || base64Url,
    size: file.size,
    type: file.type || 'application/pdf',
    uploaded_at: new Date().toISOString()
  }

  await updateApplicationStatus(referenceNumber, undefined, undefined, pdfRecord)

  return pdfRecord
}

/**
 * Delete application
 */
export async function deleteApplication(idOrRef) {
  const localList = getLocalApplications()
  const cleanId = String(idOrRef).toUpperCase()
  const filtered = localList.filter((app) => {
    return (
      String(app.id).toUpperCase() !== cleanId &&
      String(app.reference_number).toUpperCase() !== cleanId &&
      String(app.passport).toUpperCase() !== cleanId
    )
  })
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
