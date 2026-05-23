import './style.css'
import { renderPage } from './components.js'
import { updateSeo } from './seo.js'
import { getSiteContent } from './services/contentApi.js'

const app = document.querySelector('#app')
const siteContent = await getSiteContent()
const API_BASE_URL = 'https://www.hawkesburyjrgolf.ca'
const MEMBER_TOKEN_KEY = 'memberAuthToken'
const MEMBER_APP_START_URL = '/members#my-account'
let deferredInstallPrompt = null
const SCORE_COPY = {
  en: {
    loadError: 'Unable to load scores right now.',
    saveError: 'Unable to save the round right now.',
    saved: 'Round saved. 1 point added.',
    scorePrefix: 'Score',
    pointsSuffix: 'pts',
  },
  fr: {
    loadError: 'Impossible de charger les scores pour le moment.',
    saveError: 'Impossible d’enregistrer la ronde pour le moment.',
    saved: 'Ronde enregistrée. 1 point ajouté.',
    scorePrefix: 'Score',
    pointsSuffix: 'pts',
  },
}
const POINTS_COPY = {
  en: {
    loadError: 'Unable to load points right now.',
    saveError: 'Unable to save the cash out request right now.',
    saved: 'Cash out request saved.',
    pointSingular: 'pt',
    pointPlural: 'pts',
    pendingCashouts: 'Pending cash out requests',
    requested: 'Requested',
    types: {
      WELCOME: 'Welcome',
      ROUND: 'Round',
      EVENT: 'Event',
      COACH_AWARD: 'Coach Award',
      CASH_OUT: 'Cash Out',
    },
  },
  fr: {
    loadError: 'Impossible de charger les points pour le moment.',
    saveError: 'Impossible d’enregistrer la demande pour le moment.',
    saved: 'Demande enregistrée.',
    pointSingular: 'pt',
    pointPlural: 'pts',
    pendingCashouts: 'Demandes d’utilisation en attente',
    requested: 'Demandé',
    types: {
      WELCOME: 'Bienvenue',
      ROUND: 'Ronde',
      EVENT: 'Événement',
      COACH_AWARD: 'Prix de l’entraîneur',
      CASH_OUT: 'Utilisation',
    },
  },
}
const EVENTS_COPY = {
  en: {
    loadError: 'Unable to load events right now.',
    saveError: 'Unable to save the event right now.',
    saved: 'Event saved.',
    winner: 'Winner',
    points: 'pts',
    attendeeCsv: 'Attendee CSV',
    location: 'Location',
    description: 'Description',
    age: 'Age',
    ages: 'Ages',
    ageAny: 'Any age',
    spotsOpen: 'spots open',
    attending: 'Attending',
    noAttendees: 'No attendees yet.',
    join: 'Join',
    joined: 'Joined',
    leave: 'UnAdd',
    edit: 'Edit',
    remove: 'Remove',
    removeConfirm: 'Remove this event?',
    path: 'Path',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Community Event',
      EVERYONE: 'Both (Cup and Community)',
    },
    pathOnlyLabels: {
      CUP: 'CUP only',
      COMMUNITY: 'Community only',
    },
    communityCost: 'Cost for Community Member',
    full: 'Full',
  },
  fr: {
    loadError: 'Impossible de charger les événements pour le moment.',
    saveError: 'Impossible d’enregistrer l’événement pour le moment.',
    saved: 'Événement enregistré.',
    winner: 'Gagnant',
    points: 'pts',
    attendeeCsv: 'CSV des participants',
    location: 'Lieu',
    description: 'Description',
    age: 'Âge',
    ages: 'Âges',
    ageAny: 'Tous âges',
    spotsOpen: 'places disponibles',
    attending: 'Participants',
    noAttendees: 'Aucun participant pour le moment.',
    join: 'Participer',
    joined: 'Inscrit',
    leave: 'Retirer',
    edit: 'Modifier',
    remove: 'Supprimer',
    removeConfirm: 'Supprimer cet événement?',
    path: 'Parcours',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Événement communautaire',
      EVERYONE: 'Les deux (CUP et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'CUP seulement',
      COMMUNITY: 'Communauté seulement',
    },
    communityCost: 'Coût pour membre communautaire',
    full: 'Complet',
  },
}
const FIND_GAME_COPY = {
  en: {
    loadError: 'Unable to load rounds right now.',
    saveError: 'Unable to save the round right now.',
    saved: 'Round posted.',
    join: 'Join',
    joined: 'Joined',
    leave: 'UnAdd',
    full: 'Full',
    spotsOpen: 'spots open',
    playing: 'Playing',
    location: 'Location',
    age: 'Age',
    ages: 'Ages',
    ageAny: 'Any age',
    path: 'Path',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Community',
      EVERYONE: 'Both (Cup and Community)',
    },
    pathOnlyLabels: {
      CUP: 'CUP only',
      COMMUNITY: 'Community only',
    },
  },
  fr: {
    loadError: 'Impossible de charger les rondes pour le moment.',
    saveError: 'Impossible d’enregistrer la ronde pour le moment.',
    saved: 'Ronde publiée.',
    join: 'Participer',
    joined: 'Inscrit',
    leave: 'Retirer',
    full: 'Complet',
    spotsOpen: 'places disponibles',
    playing: 'Joueurs',
    location: 'Lieu',
    age: 'Âge',
    ages: 'Âges',
    ageAny: 'Tous âges',
    path: 'Parcours',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Communauté',
      EVERYONE: 'Les deux (CUP et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'CUP seulement',
      COMMUNITY: 'Communauté seulement',
    },
  },
}
const LESSON_COPY = {
  en: {
    loadError: 'Unable to load lessons right now.',
    saveError: 'Unable to save the lesson right now.',
    saved: 'Lesson saved.',
    join: 'Join',
    joined: 'Joined',
    leave: 'UnAdd',
    delete: 'Delete',
    accept: 'Accept',
    accepted: 'Accepted by',
    full: 'Full',
    single: 'Single',
    group: 'Group',
    spotsOpen: 'spots open',
    provider: 'Available by',
    requester: 'Requested by',
    students: 'Students',
    location: 'Location',
    max: 'Maximum',
    age: 'Age',
    ages: 'Ages',
    ageAny: 'Any age',
    path: 'Path',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Community',
      EVERYONE: 'Both (Cup and Community)',
    },
    pathOnlyLabels: {
      CUP: 'CUP only',
      COMMUNITY: 'Community only',
    },
  },
  fr: {
    loadError: 'Impossible de charger les leçons pour le moment.',
    saveError: 'Impossible d’enregistrer la leçon pour le moment.',
    saved: 'Leçon enregistrée.',
    join: 'Participer',
    joined: 'Inscrit',
    leave: 'Retirer',
    delete: 'Supprimer',
    accept: 'Accepter',
    accepted: 'Acceptée par',
    full: 'Complet',
    single: 'Individuelle',
    group: 'Groupe',
    spotsOpen: 'places disponibles',
    provider: 'Offerte par',
    requester: 'Demandée par',
    students: 'Élèves',
    location: 'Lieu',
    max: 'Maximum',
    age: 'Âge',
    ages: 'Âges',
    ageAny: 'Tous âges',
    path: 'Parcours',
    pathLabels: {
      CUP: 'CUP',
      COMMUNITY: 'Communauté',
      EVERYONE: 'Les deux (CUP et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'CUP seulement',
      COMMUNITY: 'Communauté seulement',
    },
  },
}
const ADMIN_COPY = {
  en: {
    loadError: 'Unable to load members right now.',
    saveError: 'Unable to update this member right now.',
    saving: 'Saving member...',
    empty: 'No members found.',
    player: 'Player',
    parentEmail: 'Parent Email',
    status: 'Status',
    memberInfo: 'Member',
    active: 'Active',
    activeYes: 'Yes',
    activeNo: 'No',
    path: 'Path',
    age: 'Age',
    ageNotSet: 'Age not set',
    notifications: 'Notifications',
    points: 'Points',
    emailVerified: 'Email confirmed',
    emailNotVerified: 'Email Not Verified',
    save: 'Save',
    manage: 'Manage',
    close: 'Close',
    cashoutTitle: 'Pending cash out requests',
    approveCashout: 'Approve',
    requested: 'Requested',
    pointHistory: 'Point history',
    pointsTab: 'Points',
    roundsTab: 'Rounds',
    eventsTab: 'Events',
    lessonsTab: 'Lessons',
    viewPoints: 'View',
    hidePoints: 'Hide',
    noPointHistory: 'No point history yet.',
    showAllPoints: 'Show all',
    pointHistoryWindowTitle: 'Point history',
    noRounds: 'No rounds yet.',
    noEvents: 'No events yet.',
    noLessons: 'No lessons yet.',
    lessonPosted: 'Lesson Posted',
    eventPosted: 'Event Posted',
    roundPosted: 'Round Posted',
    none: 'None',
    updatePoints: 'Update',
    awardReason: 'Reason',
    pointsPlaceholder: 'Example: +10 or -5',
    awardPlaceholder: 'Example: Putting challenge',
    parentEmailNotify: 'Email',
    parentTextNotify: 'Parent',
    playerTextNotify: 'Junior',
    deleteMember: 'Set Inactive',
    activateMember: 'Reactivate',
    deleteConfirm: 'Set this member inactive? You can reactivate them later from this same Manage panel.',
    noStaff: 'No admins or teachers found.',
    noCup: 'No Cup members found.',
    noCommunity: 'No Community members found.',
    noInactive: 'No inactive members found.',
    textLoading: 'Preparing text preview...',
    textNoRecipients: 'No text numbers found for this selection.',
    textSentPreview: 'Text preview ready.',
    textError: 'Unable to prepare the text preview right now.',
    textRecipientCount: 'recipients',
  },
  fr: {
    loadError: 'Impossible de charger les membres pour le moment.',
    saveError: 'Impossible de mettre ce membre à jour.',
    saving: 'Enregistrement...',
    empty: 'Aucun membre trouvé.',
    player: 'Joueur',
    parentEmail: 'Courriel parent',
    status: 'Statut',
    memberInfo: 'Membre',
    active: 'Actif',
    activeYes: 'Oui',
    activeNo: 'Non',
    path: 'Parcours',
    age: 'Âge',
    ageNotSet: 'Âge non indiqué',
    notifications: 'Avis',
    points: 'Points',
    emailVerified: 'Courriel confirmé',
    emailNotVerified: 'Courriel non vérifié',
    save: 'Enregistrer',
    manage: 'Gérer',
    close: 'Fermer',
    cashoutTitle: 'Demandes d’utilisation de points en attente',
    approveCashout: 'Approuver',
    requested: 'Demandé',
    pointHistory: 'Historique des points',
    pointsTab: 'Points',
    roundsTab: 'Rondes',
    eventsTab: 'Événements',
    lessonsTab: 'Leçons',
    viewPoints: 'Voir',
    hidePoints: 'Masquer',
    noPointHistory: 'Aucun historique de points pour le moment.',
    showAllPoints: 'Tout voir',
    pointHistoryWindowTitle: 'Historique des points',
    noRounds: 'Aucune ronde pour le moment.',
    noEvents: 'Aucun événement pour le moment.',
    noLessons: 'Aucune leçon pour le moment.',
    lessonPosted: 'Leçon publiée',
    eventPosted: 'Événement publié',
    roundPosted: 'Ronde publiée',
    none: 'Aucun',
    updatePoints: 'Mettre à jour',
    awardReason: 'Raison',
    pointsPlaceholder: 'Exemple : +10 ou -5',
    awardPlaceholder: 'Exemple : défi de putting',
    parentEmailNotify: 'Courriel',
    parentTextNotify: 'Parent',
    playerTextNotify: 'Junior',
    deleteMember: 'Rendre inactif',
    activateMember: 'Réactiver',
    deleteConfirm: 'Rendre ce membre inactif? Vous pourrez le réactiver plus tard dans ce même panneau.',
    noStaff: 'Aucun admin ou enseignant trouvé.',
    noCup: 'Aucun membre Cup trouvé.',
    noCommunity: 'Aucun membre communauté trouvé.',
    noInactive: 'Aucun membre inactif trouvé.',
    textLoading: 'Préparation de l’aperçu texto...',
    textNoRecipients: 'Aucun numéro texto trouvé pour cette sélection.',
    textSentPreview: 'Aperçu texto prêt.',
    textError: 'Impossible de préparer l’aperçu texto pour le moment.',
    textRecipientCount: 'destinataires',
  },
}
let pendingProfileToken = sessionStorage.getItem('pendingProfileToken') || ''
let memberToken = localStorage.getItem(MEMBER_TOKEN_KEY) || ''
let isLoggedIn = isStoredTokenCurrent(memberToken)
let currentMember = getTokenPayload(memberToken)
let currentEventsById = new Map()
let isEventAdminModeOpen = false
let currentAdminMembers = []
let currentAdminCashouts = []
let currentAdminFilter = 'staff'
let expandedAdminMemberId = null
let currentAdminDetailTab = 'points'
let hasCheckedSession = false

function getLanguage() {
  return localStorage.getItem('language') === 'fr' ? 'fr' : 'en'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function memberNameHtml(name, membershipType = '') {
  const type = String(membershipType || '').toLowerCase()
  const className = ['cup', 'community'].includes(type) ? ` member-name is-${type}` : 'member-name'

  return `<span class="${className.trim()}">${escapeHtml(name)}</span>`
}

function memberPathLabel(membershipType = '') {
  const type = String(membershipType || '').toUpperCase()

  if (type === 'CUP') {
    return 'CUP'
  }

  if (type === 'COMMUNITY') {
    return 'Community'
  }

  return type
}

function memberNameWithPathHtml(name, membershipType = '') {
  const pathLabel = memberPathLabel(membershipType)

  return `${memberNameHtml(name, membershipType)}${pathLabel ? ` [${escapeHtml(pathLabel)}]` : ''}`
}

function accountStreamLabel(membershipType = '') {
  const type = String(membershipType || '').toUpperCase()

  if (type === 'CUP') {
    return 'Cup'
  }

  if (type === 'COMMUNITY') {
    return 'Community'
  }

  if (type === 'ADMIN') {
    return 'Admin'
  }

  if (type === 'TEACHER') {
    return 'Teacher'
  }

  return type
}

function setLanguage(language) {
  localStorage.setItem('language', language)
  render()
}

function isMemberPortalPath() {
  return ['/member', '/members'].includes(window.location.pathname.replace(/\/+$/, ''))
}

function getCurrentRoute() {
  const isMemberPortal = isMemberPortalPath()
  const routeId = window.location.hash.replace('#', '') || (isMemberPortal ? 'my-account' : 'home')
  const page = siteContent.pageMap.get(routeId) || siteContent.pageMap.get(isMemberPortal ? 'my-account' : 'home')

  if (isMemberPortal && page?.template !== 'login' && !page?.accountArea) {
    return siteContent.pageMap.get('my-account')
  }

  return page
}

function getTokenPayload(token) {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return null
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    )

    return JSON.parse(atob(paddedPayload))
  } catch (error) {
    return null
  }
}

function isStoredTokenCurrent(token) {
  const payload = getTokenPayload(token)

  return Boolean(payload?.exp && payload.exp * 1000 > Date.now())
}

async function checkMemberSession() {
  memberToken = localStorage.getItem(MEMBER_TOKEN_KEY) || ''

  if (!isStoredTokenCurrent(memberToken)) {
    clearMemberLogin()
    isLoggedIn = false
    hasCheckedSession = true
    return
  }

  try {
    const sessionUrl = `${API_BASE_URL}/api/session.php?token=${encodeURIComponent(memberToken)}`
    const response = await fetch(sessionUrl, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await response.json()

    isLoggedIn = response.ok && result.authenticated === true

    if (!isLoggedIn) {
      clearMemberLogin()
    } else {
      currentMember = result.member || getTokenPayload(memberToken)
    }
  } catch (error) {
    isLoggedIn = isStoredTokenCurrent(memberToken)
    currentMember = isLoggedIn ? getTokenPayload(memberToken) : null
  } finally {
    hasCheckedSession = true
  }
}

async function render() {
  const language = getLanguage()
  const copy = siteContent.shared[language]
  const isMemberPortal = isMemberPortalPath()
  let page = getCurrentRoute()

  if (page.accountArea && !hasCheckedSession) {
    await checkMemberSession()
  }

  if (page.accountArea && !isLoggedIn) {
    window.location.hash = 'login'
    page = siteContent.pageMap.get('login')
  }

  document.documentElement.lang = language
  updateSeo(page, language, copy)

  app.innerHTML = renderPage({
    routes: siteContent.pages,
    page,
    language,
    copy,
    isLoggedIn,
    member: currentMember,
    isMemberPortal,
  })

  if (page.id === 'scores') {
    initializeScoresTool(language)
  }

  if (page.id === 'points') {
    initializePointsTool(language)
  }

  if (page.id === 'events') {
    initializeEventsTool(language)
  }

  if (page.id === 'find-a-game') {
    initializeFindGameTool(language)
  }

  if (page.id === 'book-a-lesson') {
    initializeLessonTool(language)
  }

  if (page.id === 'my-account') {
    initializeAccountProfile(language)
  }
}

function markMemberLoggedIn(token) {
  if (!token) {
    clearMemberLogin()
    return
  }

  memberToken = token
  isLoggedIn = true
  currentMember = getTokenPayload(token)
  hasCheckedSession = true
  localStorage.setItem(MEMBER_TOKEN_KEY, token)
}

function clearMemberLogin() {
  memberToken = ''
  isLoggedIn = false
  currentMember = null
  localStorage.removeItem(MEMBER_TOKEN_KEY)
}

function logMemberOut() {
  clearMemberLogin()
  hasCheckedSession = true
  window.location.hash = 'login'
  render()
}

async function handleAccountSubmit(form) {
  const status = form.querySelector('[data-account-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const formType = form.dataset.accountForm

  formData.set('session_mode', isMemberPortalPath() ? 'app' : 'site')

  if (formType === 'profile') {
    const tokenInput = form.querySelector('[data-profile-token]')
    const profileToken = tokenInput?.value || pendingProfileToken || sessionStorage.getItem('pendingProfileToken') || ''

    if (profileToken) {
      formData.set('profile_token', profileToken)
    }
  }
  const apiFile = formType === 'join'
    ? 'register'
    : formType === 'profile'
      ? 'profile'
      : formType === 'resend'
        ? 'resend-verification'
        : formType === 'forgot'
          ? 'forgot-password'
        : 'login'
  const endpoint = `${API_BASE_URL}/api/${apiFile}.php`

  if (status) {
    status.textContent = formType === 'join'
      ? 'Creating account...'
      : formType === 'profile'
        ? 'Saving contact details...'
        : formType === 'resend'
          ? 'Sending verification email...'
          : formType === 'forgot'
            ? 'Sending password reset link...'
          : 'Checking account...'
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const result = await response.json()

    if (status) {
      status.textContent = result.message || 'Unable to log in right now.'
      status.classList.toggle('success', response.ok && result.ok)
      status.classList.toggle('error', !response.ok || !result.ok)
    }

    const shouldShowProfile = response.ok
      && result.ok
      && (result.requiresProfile || result.message?.toLowerCase().includes('complete'))

    if (shouldShowProfile) {
      pendingProfileToken = result.profileToken || pendingProfileToken
      sessionStorage.setItem('pendingProfileToken', pendingProfileToken)
      const panel = form.closest('.login-panel')

      if (panel) {
        showAccountForm(panel, 'profile')

        const tokenInput = panel.querySelector('[data-account-form="profile"] [data-profile-token]')
        const usernameInput = panel.querySelector('[data-account-form="profile"] [data-profile-username]')
        const passwordInput = panel.querySelector('[data-account-form="profile"] [data-profile-password]')

        if (tokenInput) {
          tokenInput.value = pendingProfileToken
        }

        if (formType === 'login') {
          if (usernameInput) {
            usernameInput.value = formData.get('username') || ''
          }

          if (passwordInput) {
            passwordInput.value = formData.get('password') || ''
          }
        }

        const profileStatus = panel.querySelector('[data-account-form="profile"] [data-account-status]')

        if (profileStatus) {
          profileStatus.textContent = result.message || 'Please complete the parent and player contact details.'
          profileStatus.classList.add('success')
          profileStatus.classList.remove('error')
        }
      }
    }

    if (response.ok && result.ok && formType === 'profile') {
      markMemberLoggedIn(result.token)
      pendingProfileToken = ''
      sessionStorage.removeItem('pendingProfileToken')
      window.location.hash = 'my-account'
      render()
    }

    if (response.ok && result.ok && formType === 'login' && !shouldShowProfile) {
      markMemberLoggedIn(result.token)
      window.location.hash = 'my-account'
      render()
    }
  } catch (error) {
    if (status) {
      status.textContent = 'Unable to reach the account service right now.'
      status.classList.add('error')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

async function refreshMemberTokenForMode(mode) {
  if (!memberToken) {
    return false
  }

  const formData = new FormData()
  formData.set('session_mode', mode === 'app' ? 'app' : 'site')

  const response = await fetch(`${API_BASE_URL}/api/session-token.php`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${memberToken}`,
    },
  })
  const result = await response.json()

  if (!response.ok || !result.ok || !result.token) {
    throw new Error(result.message || 'Unable to refresh session.')
  }

  markMemberLoggedIn(result.token)
  return true
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

async function promptForMemberAppInstall() {
  if (isRunningStandalone()) {
    return
  }

  if (deferredInstallPrompt) {
    const installPrompt = deferredInstallPrompt
    deferredInstallPrompt = null

    try {
      installPrompt.prompt()
      await installPrompt.userChoice
    } catch (error) {
      deferredInstallPrompt = installPrompt
    }

    return
  }

  const language = getLanguage()
  const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent)

  if (isiOS) {
    window.alert(language === 'fr'
      ? 'Pour installer l’espace membre, appuyez sur ... au bas de l’écran, choisissez Partager, puis faites défiler vers Ajouter à l’écran d’accueil.'
      : 'To install the member area, press ... at the bottom of the screen, choose Share, then scroll down to Add to Home Screen.')
  }
}

async function handleSessionModeLink(link) {
  const mode = link.dataset.sessionModeLink || 'site'
  const href = mode === 'app'
    ? MEMBER_APP_START_URL
    : link.getAttribute('href') || '/'

  try {
    if (mode === 'app') {
      await promptForMemberAppInstall()
    }

    await refreshMemberTokenForMode(mode)
  } catch (error) {
    clearMemberLogin()
  } finally {
    window.location.href = href
  }
}

function showAccountForm(panel, tabName) {
  const tabs = panel.querySelectorAll('[data-account-tab]')
  const forms = panel.querySelectorAll('[data-account-form]')

  tabs.forEach((tab) => {
    if (tab.dataset.accountTab === 'profile' && tabName === 'profile') {
      tab.classList.remove('is-hidden')
    }

    const isActive = tab.dataset.accountTab === tabName
    tab.classList.toggle('active', isActive)
  })

  forms.forEach((form) => {
    form.classList.toggle('is-hidden', form.dataset.accountForm !== tabName)
  })
}

function updatePlayerTextField(input) {
  const form = input.closest('[data-account-form="profile"]')
  const field = form?.querySelector('[data-player-text-field]')
  const playerTextInput = field?.querySelector('input')
  const shouldShow = Number(input.value) > 12

  field?.classList.toggle('is-hidden', !shouldShow)

  if (playerTextInput) {
    playerTextInput.required = shouldShow

    if (!shouldShow) {
      playerTextInput.value = ''
    }
  }
}

function setAccountProfileFormValues(form, member) {
  const playerName = [member?.firstName, member?.lastName].filter(Boolean).join(' ') || member?.username || ''
  const streamInput = form.querySelector('input[name="stream"]')
  const playerNameInput = form.querySelector('input[name="player_name"]')
  const parentEmailInput = form.querySelector('input[name="parent_email"]')
  const parentTextInput = form.querySelector('input[name="parent_text"]')
  const playerTextInput = form.querySelector('input[name="player_text"]')

  if (playerNameInput) {
    playerNameInput.value = playerName
  }

  if (streamInput) {
    streamInput.value = accountStreamLabel(member?.membershipType) || member?.membershipType || ''
  }

  if (parentEmailInput) {
    parentEmailInput.value = member?.parentEmail || ''
  }

  if (parentTextInput) {
    parentTextInput.value = member?.parentText || ''
  }

  if (playerTextInput) {
    playerTextInput.value = member?.playerText || ''
  }

  const notificationSettings = {
    notify_lessons_parent_email: member?.notifyLessonsParentEmail,
    notify_lessons_player_text: member?.notifyLessonsPlayerText,
    notify_lessons_parent_text: member?.notifyLessonsParentText,
    notify_events_parent_email: member?.notifyEventsParentEmail,
    notify_events_player_text: member?.notifyEventsPlayerText,
    notify_events_parent_text: member?.notifyEventsParentText,
    notify_games_parent_email: member?.notifyGamesParentEmail,
    notify_games_player_text: member?.notifyGamesPlayerText,
    notify_games_parent_text: member?.notifyGamesParentText,
  }

  Object.entries(notificationSettings).forEach(([name, value]) => {
    const input = form.querySelector(`input[name="${name}"]`)

    if (input) {
      input.checked = Boolean(value)
    }
  })
}

function adminPathOption(value, label, selected) {
  return `<option value="${value}" ${value === selected ? 'selected' : ''}>${label}</option>`
}

function getFilteredAdminMembers(members) {
  return members.filter((member) => {
    const type = String(member.membershipType || '').toUpperCase()
    const isActive = member.isActive !== false

    if (currentAdminFilter === 'inactive') {
      return !isActive
    }

    if (!isActive) {
      return false
    }

    if (currentAdminFilter === 'staff') {
      return ['ADMIN', 'TEACHER'].includes(type)
    }

    if (currentAdminFilter === 'cup') {
      return type === 'CUP'
    }

    if (currentAdminFilter === 'community') {
      return type === 'COMMUNITY'
    }

    return true
  })
}

function getAdminEmptyLabel(language) {
  const copy = ADMIN_COPY[language]

  if (currentAdminFilter === 'staff') {
    return copy.noStaff
  }

  if (currentAdminFilter === 'cup') {
    return copy.noCup
  }

  if (currentAdminFilter === 'community') {
    return copy.noCommunity
  }

  if (currentAdminFilter === 'inactive') {
    return copy.noInactive
  }

  return copy.empty
}

function getAdminFilterCounts(members) {
  return members.reduce((counts, member) => {
    const type = String(member.membershipType || '').toUpperCase()
    const isActive = member.isActive !== false

    if (!isActive) {
      counts.inactive += 1
      return counts
    }

    if (['ADMIN', 'TEACHER'].includes(type)) {
      counts.staff += 1
    }

    if (type === 'CUP') {
      counts.cup += 1
    }

    if (type === 'COMMUNITY') {
      counts.community += 1
    }

    return counts
  }, {
    staff: 0,
    cup: 0,
    community: 0,
    inactive: 0,
  })
}

function updateAdminFilterCounts(panel, members) {
  const counts = getAdminFilterCounts(members)

  Object.entries(counts).forEach(([filter, count]) => {
    const countEl = panel?.querySelector(`[data-admin-filter-count="${filter}"]`)

    if (countEl) {
      countEl.textContent = String(count)
    }
  })
}

function updateAdminFilterButtons(panel) {
  panel?.querySelectorAll('[data-admin-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminFilter === currentAdminFilter)
  })
}

function setAdminTextModalOpen(panel, isOpen) {
  const modal = panel?.querySelector('[data-admin-text-modal]')
  const form = modal?.querySelector('[data-admin-text-form]')

  if (!modal) {
    return
  }

  modal.classList.toggle('is-hidden', !isOpen)
  modal.setAttribute('aria-hidden', String(!isOpen))

  if (isOpen) {
    modal.querySelector('textarea[name="message"]')?.focus()
  } else {
    form?.reset()
    const results = modal.querySelector('[data-admin-text-results]')

    if (results) {
      results.innerHTML = ''
      results.classList.remove('error', 'success')
    }
  }
}

function normalizeTextNumber(value) {
  return String(value || '').replace(/[^\d+]/g, '')
}

function addTextRecipient(recipients, seenNumbers, number, name, type) {
  const normalizedNumber = normalizeTextNumber(number)

  if (!normalizedNumber || seenNumbers.has(normalizedNumber)) {
    return
  }

  seenNumbers.add(normalizedNumber)
  recipients.push({
    to: normalizedNumber,
    name: String(name || '').trim(),
    type,
  })
}

function getAdminTextRecipients(target) {
  const recipients = []
  const seenNumbers = new Set()

  currentAdminMembers
    .filter((member) => member?.isActive !== false)
    .forEach((member) => {
      const playerName = member.name || member.username || ''
      const parentName = member.parentName || (playerName ? `Parent of ${playerName}` : 'Parent')

      if (target === 'all' || target === 'parents') {
        addTextRecipient(recipients, seenNumbers, member.parentText, parentName, 'parent')
      }

      if (target === 'all' || target === 'juniors') {
        addTextRecipient(recipients, seenNumbers, member.playerText, playerName, 'junior')
      }
    })

  return recipients
}

function renderAdminTextResults(resultsEl, result, language) {
  const copy = ADMIN_COPY[language]
  const rows = Array.isArray(result.results) ? result.results : []

  resultsEl.classList.toggle('success', Boolean(result.ok))
  resultsEl.classList.toggle('error', !result.ok)
  resultsEl.innerHTML = `
    <strong>${escapeHtml(result.message || copy.textSentPreview)}</strong>
    <small>${Number(result.sent || 0)} ${escapeHtml(copy.textRecipientCount)} / ${Number(result.failed || 0)} failed</small>
    ${rows.length ? `
      <ul>
        ${rows.map((row) => `
          <li class="${row.ok ? 'success' : 'error'}">
            <span>${escapeHtml(row.name || '')}${row.name ? ' - ' : ''}${escapeHtml(row.to || '')}</span>
            <small>${escapeHtml(row.message || row.sid || '')}</small>
          </li>
        `).join('')}
      </ul>
    ` : ''}
  `
}

async function handleAdminTextSubmit(form) {
  const panel = form.closest('[data-admin-panel]')
  const language = getLanguage()
  const copy = ADMIN_COPY[language]
  const resultsEl = form.querySelector('[data-admin-text-results]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const target = String(formData.get('target') || 'all')
  const message = String(formData.get('message') || '').trim()
  const recipients = getAdminTextRecipients(target)

  if (!resultsEl) {
    return
  }

  if (!recipients.length) {
    resultsEl.textContent = copy.textNoRecipients
    resultsEl.classList.add('error')
    resultsEl.classList.remove('success')
    return
  }

  resultsEl.textContent = copy.textLoading
  resultsEl.classList.remove('error', 'success')

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/textme.php`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${memberToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        recipients,
      }),
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || copy.textError)
    }

    renderAdminTextResults(resultsEl, result, language)
  } catch (error) {
    resultsEl.textContent = error.message || copy.textError
    resultsEl.classList.add('error')
    resultsEl.classList.remove('success')
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function renderAdminDetailTabs(copy, activeTab) {
  const tabs = [
    ['points', copy.pointsTab],
    ['rounds', copy.roundsTab],
    ['events', copy.eventsTab],
    ['lessons', copy.lessonsTab],
  ]

  return `
    <div class="admin-detail-tabs" role="tablist" aria-label="${copy.manage}">
      ${tabs.map(([value, label]) => `
        <button type="button" class="${activeTab === value ? 'active' : ''}" data-admin-detail-tab="${value}">
          ${label}
        </button>
      `).join('')}
    </div>
  `
}

function renderAdminPointsTab(member, copy, language) {
  const entries = Array.isArray(member.pointEntries) ? member.pointEntries : []
  const visibleEntries = entries.slice(0, 5)

  return `
    <div class="admin-tab-grid">
      <div class="admin-history-panel">
        <h3>${copy.pointHistory}</h3>
        ${entries.length ? `
          <ul>
            ${visibleEntries.map((entry) => {
              const typeLabel = POINTS_COPY[language].types[entry.type] || entry.type
              const amountClass = Number(entry.points || 0) < 0 ? 'is-negative' : 'is-positive'

              return `
                <li>
                  <span>
                    <strong>${escapeHtml(entry.description || typeLabel)}</strong>
                    <small>${escapeHtml(typeLabel)} - ${formatRoundDate(entry.date, language)}</small>
                  </span>
                  <small class="${amountClass}">${formatPointAmount(Number(entry.points || 0), language)}</small>
                </li>
              `
            }).join('')}
          </ul>
          ${entries.length > 5 ? `
            <button class="admin-history-all" type="button" data-admin-points-all data-member-id="${Number(member.id || 0)}">
              ${copy.showAllPoints}
            </button>
          ` : ''}
        ` : `<p>${copy.noPointHistory}</p>`}
      </div>
      <form class="admin-award-form" data-admin-award-form>
        <input type="hidden" name="action" value="update_points" />
        <input type="hidden" name="member_id" value="${Number(member.id || 0)}" />
        <label>
          <span>${copy.points} (+/-)</span>
          <input type="number" name="points" min="-999" max="999" step="1" inputmode="numeric" placeholder="${copy.pointsPlaceholder}" required />
        </label>
        <label>
          <span>${copy.awardReason}</span>
          <input type="text" name="description" maxlength="160" placeholder="${copy.awardPlaceholder}" required />
        </label>
        <button type="submit">${copy.updatePoints}</button>
      </form>
    </div>
  `
}

function renderAdminRoundsTab(member, copy, language) {
  const rounds = Array.isArray(member.rounds) ? member.rounds : []

  return rounds.length ? `
    <div class="admin-history-panel">
      <h3>${copy.roundsTab}</h3>
      <ul>
        ${rounds.map((round) => `
          <li>
            <span>
              <strong>${formatRoundDate(round.date, language)} - ${escapeHtml(round.score)}</strong>
              <small>${escapeHtml(round.tee || '')} tee - ${escapeHtml(round.format || '')}</small>
            </span>
          </li>
        `).join('')}
      </ul>
    </div>
  ` : `<div class="admin-history-panel"><h3>${copy.roundsTab}</h3><p>${copy.noRounds}</p></div>`
}

function renderAdminEventsTab(member, copy, language) {
  const events = Array.isArray(member.events) ? member.events : []

  return events.length ? `
    <div class="admin-history-panel">
      <h3>${copy.eventsTab}</h3>
      <ul>
        ${events.map((event) => `
          <li>
            <span>
              <strong>${escapeHtml(event.name || copy.eventsTab)}</strong>
              <small>${escapeHtml(event.role || '')} - ${escapeHtml(formatEventDateTime({ eventDate: event.date, eventTime: event.time }, language))}</small>
              <small>${escapeHtml(accountStreamLabel(event.path))}${event.location ? ` - ${escapeHtml(event.location)}` : ''}</small>
            </span>
            <small>${Number(event.participantPoints || 0)} / ${Number(event.winnerPoints || 0)} pts</small>
          </li>
        `).join('')}
      </ul>
    </div>
  ` : `<div class="admin-history-panel"><h3>${copy.eventsTab}</h3><p>${copy.noEvents}</p></div>`
}

function renderAdminLessonsTab(member, copy, language) {
  const lessons = Array.isArray(member.lessons) ? member.lessons : []

  return lessons.length ? `
    <div class="admin-history-panel">
      <h3>${copy.lessonsTab}</h3>
      <ul>
        ${lessons.map((lesson) => `
          <li>
            <span>
              <strong>${escapeHtml(lesson.role || copy.lessonsTab)} - ${escapeHtml(formatEventDateTime({ eventDate: lesson.date, eventTime: lesson.time }, language))}</strong>
              <small>${escapeHtml(lesson.type || '')} - ${escapeHtml(accountStreamLabel(lesson.path))}${lesson.location ? ` - ${escapeHtml(lesson.location)}` : ''}</small>
              ${lesson.notes ? `<small>${escapeHtml(lesson.notes)}</small>` : ''}
            </span>
          </li>
        `).join('')}
      </ul>
    </div>
  ` : `<div class="admin-history-panel"><h3>${copy.lessonsTab}</h3><p>${copy.noLessons}</p></div>`
}

function renderAdminDetailTabContent(member, copy, language, activeTab) {
  if (activeTab === 'rounds') {
    return renderAdminRoundsTab(member, copy, language)
  }

  if (activeTab === 'events') {
    return renderAdminEventsTab(member, copy, language)
  }

  if (activeTab === 'lessons') {
    return renderAdminLessonsTab(member, copy, language)
  }

  return renderAdminPointsTab(member, copy, language)
}

function renderAdminNotificationSummary(member, copy) {
  const methods = [
    [copy.parentEmailNotify, 'ParentEmail', 'parentEmailNotify'],
    [copy.playerTextNotify, 'PlayerText', 'playerTextNotify'],
    [copy.parentTextNotify, 'ParentText', 'parentTextNotify'],
  ]
  const rows = [
    [copy.lessonPosted, 'notifyLessons'],
    [copy.eventPosted, 'notifyEvents'],
    [copy.roundPosted, 'notifyGames'],
  ]
  const hasNewNotificationValues = rows.some(([, prefix]) => methods.some(([, suffix]) => Boolean(member?.[`${prefix}${suffix}`])))

  return `
    <div class="admin-notification-summary">
      <h3>${copy.notifications}</h3>
      <div class="admin-notification-groups">
        ${rows.map(([label, prefix]) => `
          <section class="admin-notification-group">
            <strong>${label}</strong>
            <div class="admin-notification-methods">
              ${methods.map(([methodLabel, suffix, legacyKey]) => {
                const enabled = hasNewNotificationValues
                  ? Boolean(member?.[`${prefix}${suffix}`])
                  : Boolean(member?.[legacyKey])
                return `
                  <span class="admin-notification-method ${enabled ? 'is-on' : 'is-off'}">
                    <span class="admin-notification-dot" aria-hidden="true"></span>
                    ${escapeHtml(methodLabel)}
                  </span>
                `
              }).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </div>
  `
}

function openAdminPointHistoryWindow(memberId, language) {
  const copy = ADMIN_COPY[language]
  const member = currentAdminMembers.find((item) => Number(item.id || 0) === Number(memberId || 0))
  const entries = Array.isArray(member?.pointEntries) ? member.pointEntries : []
  const name = member?.name || member?.username || copy.player
  const rows = entries.length
    ? entries.map((entry) => {
      const typeLabel = POINTS_COPY[language].types[entry.type] || entry.type
      const amount = Number(entry.points || 0)
      const amountClass = amount < 0 ? 'negative' : 'positive'

      return `
        <li>
          <span>
            <strong>${escapeHtml(entry.description || typeLabel)}</strong>
            <small>${escapeHtml(typeLabel)} - ${formatRoundDate(entry.date, language)}</small>
          </span>
          <b class="${amountClass}">${formatPointAmount(amount, language)}</b>
        </li>
      `
    }).join('')
    : `<p>${copy.noPointHistory}</p>`
  const historyWindow = window.open('', '_blank')

  if (!historyWindow) {
    return
  }

  historyWindow.document.write(`
    <!doctype html>
    <html lang="${language}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(copy.pointHistoryWindowTitle)} - ${escapeHtml(name)}</title>
        <style>
          body { margin: 0; padding: 24px; color: #0c3d2d; font-family: Arial, sans-serif; background: #f7fbf9; }
          main { max-width: 980px; margin: 0 auto; }
          h1 { margin: 0 0 6px; font-size: 1.6rem; }
          p { color: #5d6b64; font-weight: 700; }
          ul { display: grid; gap: 8px; margin: 18px 0 0; padding: 0; list-style: none; }
          li { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 12px; border: 1px solid rgba(12, 61, 45, 0.14); border-radius: 8px; background: #fff; }
          strong, small { display: block; }
          small { margin-top: 3px; color: #5d6b64; font-weight: 700; }
          b { white-space: nowrap; }
          .positive { color: #217a4b; }
          .negative { color: #c46a16; }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(copy.pointHistoryWindowTitle)}</h1>
          <p>${escapeHtml(name)} - ${entries.length} ${escapeHtml(POINTS_COPY[language].pointPlural)}</p>
          <ul>${rows}</ul>
        </main>
      </body>
    </html>
  `)
  historyWindow.document.close()
}

function renderAdminMembers(panel, members, language) {
  const container = panel.querySelector('[data-admin-members]')
  const copy = ADMIN_COPY[language]
  const filteredMembers = getFilteredAdminMembers(members)

  updateAdminFilterCounts(panel, members)
  updateAdminFilterButtons(panel)

  if (!container) {
    return
  }

  if (!filteredMembers.length) {
    container.innerHTML = `<p>${getAdminEmptyLabel(language)}</p>`
    return
  }

  container.innerHTML = `
    <div class="admin-members-table" role="table" aria-label="${copy.player}">
      <div class="admin-members-row admin-members-head" role="row">
        <span>${copy.player}</span>
        <span>${copy.parentEmail}</span>
        <span>${copy.status}</span>
        <span>${copy.path} / ${copy.age}</span>
        <span>${copy.points}</span>
        <span></span>
      </div>
      ${filteredMembers.map((member) => {
        const membershipType = String(member.membershipType || '').toUpperCase()
        const isVerified = Boolean(member.emailVerified)
        const isActive = member.isActive !== false
        const isExpanded = Number(member.id || 0) === Number(expandedAdminMemberId || 0)

        return `
          <div class="admin-members-row" role="row">
            <span data-label="${escapeHtml(copy.memberInfo)}">
              <strong>${escapeHtml(member.name || member.username || '')}</strong>
              <small>${escapeHtml(member.username || '')} - ${isActive ? copy.activeYes : copy.activeNo}</small>
            </span>
            <span data-label="${escapeHtml(copy.parentEmail)}">${escapeHtml(member.parentEmail || '')}</span>
            <span data-label="${escapeHtml(copy.status)}">
              <strong>${isVerified ? copy.emailVerified : copy.emailNotVerified}</strong>
            </span>
            <span data-label="${escapeHtml(`${copy.path} / ${copy.age}`)}">
              <strong>${escapeHtml(accountStreamLabel(membershipType))}</strong>
              <small>${member.playerAge ? `${copy.age} ${Number(member.playerAge)}` : copy.ageNotSet}</small>
            </span>
            <span data-label="${escapeHtml(copy.points)}"><strong>${Number(member.points || 0)}</strong></span>
            <span class="admin-row-actions">
              <button class="admin-points-toggle" type="button" data-admin-points-toggle data-member-id="${Number(member.id || 0)}">${isExpanded ? copy.close : copy.manage}</button>
            </span>
          </div>
          ${isExpanded ? `
            <section class="admin-point-detail">
              <form id="admin-member-form-${Number(member.id || 0)}" class="admin-manage-form" data-admin-member-form>
                <input type="hidden" name="action" value="update_member" />
                <input type="hidden" name="member_id" value="${Number(member.id || 0)}" />
                <input type="hidden" name="email_verified_present" value="1" />
                <h3>${copy.manage}</h3>
                <label>
                  <span>${copy.age}</span>
                  <input type="number" name="player_age" min="1" max="18" inputmode="numeric" value="${member.playerAge ? Number(member.playerAge) : ''}" required />
                </label>
                <label>
                  <span>${copy.path}</span>
                  <select name="membership_type">
                    ${adminPathOption('CUP', 'Cup', membershipType)}
                    ${adminPathOption('COMMUNITY', 'Community', membershipType)}
                    ${adminPathOption('TEACHER', 'Teacher', membershipType)}
                    ${adminPathOption('ADMIN', 'Admin', membershipType)}
                  </select>
                </label>
                <label class="account-notify-toggle admin-verify-toggle">
                  <input type="checkbox" name="email_verified" ${isVerified ? 'checked' : ''} />
                  <span>${isVerified ? copy.emailVerified : copy.emailNotVerified}</span>
                </label>
                ${renderAdminNotificationSummary(member, copy)}
              </form>
              <div class="admin-detail-panel">
                ${renderAdminDetailTabs(copy, currentAdminDetailTab)}
                ${renderAdminDetailTabContent(member, copy, language, currentAdminDetailTab)}
              </div>
              <div class="admin-member-bottom-actions">
                <button type="submit" form="admin-member-form-${Number(member.id || 0)}">${copy.save}</button>
                <form class="admin-delete-form" data-admin-delete-form>
                  <input type="hidden" name="action" value="${isActive ? 'set_inactive_member' : 'activate_member'}" />
                  <input type="hidden" name="member_id" value="${Number(member.id || 0)}" />
                  <button class="${isActive ? '' : 'admin-reactivate'}" type="submit">${isActive ? copy.deleteMember : copy.activateMember}</button>
                </form>
              </div>
            </section>
          ` : ''}
        `
      }).join('')}
    </div>
  `
}

function renderAdminCashouts(panel, requests, language) {
  const container = panel.querySelector('[data-admin-cashouts]')
  const copy = ADMIN_COPY[language]

  if (!container) {
    return
  }

  if (!requests.length) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="admin-cashout-panel">
      <h3>${copy.cashoutTitle}</h3>
      <div class="admin-cashout-items">
        ${requests.map((request) => `
          <form class="admin-cashout-item" data-admin-cashout-form>
            <input type="hidden" name="action" value="approve_cashout" />
            <input type="hidden" name="cashout_id" value="${Number(request.id || 0)}" />
            <span>
              <strong>${escapeHtml(request.name || request.username || '')}</strong>
              <small>${escapeHtml(accountStreamLabel(request.membershipType))} • ${copy.requested} ${formatPointAmount(-1 * Number(request.points || 0), language)}</small>
            </span>
            <span>${Number(request.balance || 0)} ${POINTS_COPY[language].pointPlural}</span>
            <button type="submit">${copy.approveCashout}</button>
          </form>
        `).join('')}
      </div>
    </div>
  `
}

async function loadAdminMembers(panel, language) {
  const status = panel.querySelector('[data-admin-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || ADMIN_COPY[language].loadError)
    }

    currentAdminMembers = result.members || []
    currentAdminCashouts = result.cashoutRequests || []
    renderAdminCashouts(panel, currentAdminCashouts, language)
    renderAdminMembers(panel, currentAdminMembers, language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || ADMIN_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

async function handleAdminMemberSubmit(form) {
  const panel = form.closest('[data-admin-panel]')
  const language = getLanguage()
  const status = panel?.querySelector('[data-admin-status]')
  const button = form.querySelector('button[type="submit"]') || (form.id ? document.querySelector(`button[form="${form.id}"]`) : null)
  const formData = new FormData(form)
  const action = String(formData.get('action') || '')

  if (status) {
    status.textContent = ADMIN_COPY[language].saving
    status.classList.remove('error', 'success')
  }

  if (button) {
    button.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || ADMIN_COPY[language].saveError)
    }

    currentAdminMembers = result.members || []
    currentAdminCashouts = result.cashoutRequests || []

    if (action === 'set_inactive_member') {
      currentAdminFilter = 'inactive'
    }

    renderAdminCashouts(panel, currentAdminCashouts, language)
    renderAdminMembers(panel, currentAdminMembers, language)

    if (status) {
      status.textContent = result.message || 'Member updated.'
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || ADMIN_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }

    if (button) {
      button.disabled = false
    }
  }
}

async function initializeAccountProfile(language) {
  const form = document.querySelector('[data-account-profile-form]')
  const status = form?.querySelector('[data-account-profile-status]')
  const adminPanel = document.querySelector('[data-admin-panel]')

  if (!form) {
    return
  }

  if (adminPanel) {
    loadAdminMembers(adminPanel, language)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/account.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Unable to load account details.')
    }

    setAccountProfileFormValues(form, result.member)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || 'Unable to load account details.'
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

async function handleAccountProfileSubmit(form) {
  const status = form.querySelector('[data-account-profile-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = 'Saving account details...'
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/account.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Unable to save account details.')
    }

    setAccountProfileFormValues(form, result.member)

    if (status) {
      status.textContent = result.message || 'Account details saved.'
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || 'Unable to save account details.'
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function formatRoundDate(value, language) {
  if (!value) {
    return ''
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatEventDate(value, language) {
  if (!value) {
    return ''
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function toDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateFromValue(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date()

  return Number.isNaN(date.getTime()) ? new Date() : date
}

function getCalendarMonthLabel(date, language) {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getCalendarWeekdays(language) {
  const baseDate = new Date(2024, 0, 7)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + index)

    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
      weekday: 'short',
    }).format(date)
  })
}

function renderDatePickerCalendar(picker, language) {
  const input = picker.querySelector('[data-date-input]')
  const label = picker.querySelector('[data-date-picker-label]')
  const popover = picker.querySelector('[data-date-picker-popover]')

  if (!input || !label || !popover) {
    return
  }

  const selectedDate = getDateFromValue(input.value)
  const calendarMonth = picker.dataset.calendarMonth
    ? getDateFromValue(`${picker.dataset.calendarMonth}-01`)
    : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - monthStart.getDay())
  const selectedValue = toDateValue(selectedDate)
  const todayValue = toDateValue(new Date())

  picker.dataset.calendarMonth = toDateValue(monthStart).slice(0, 7)
  label.textContent = formatRoundDate(input.value, language)

  popover.innerHTML = `
    <div class="date-picker-header">
      <button type="button" data-calendar-prev aria-label="${language === 'fr' ? 'Mois précédent' : 'Previous month'}">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M12.5 5 7.5 10l5 5" /></svg>
      </button>
      <strong>${getCalendarMonthLabel(monthStart, language)}</strong>
      <button type="button" data-calendar-next aria-label="${language === 'fr' ? 'Mois suivant' : 'Next month'}">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m7.5 5 5 5-5 5" /></svg>
      </button>
    </div>
    <div class="date-picker-weekdays">
      ${getCalendarWeekdays(language).map((day) => `<span>${day}</span>`).join('')}
    </div>
    <div class="date-picker-days">
      ${Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + index)
        const value = toDateValue(date)
        const isSelected = value === selectedValue
        const isToday = value === todayValue
        const isOutsideMonth = date.getMonth() !== monthStart.getMonth()

        return `
          <button
            type="button"
            data-calendar-date="${value}"
            class="${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${isOutsideMonth ? 'is-outside-month' : ''}"
          >
            ${date.getDate()}
          </button>
        `
      }).join('')}
    </div>
  `
}

function updateDatePickerValue(picker, value, language) {
  const input = picker.querySelector('[data-date-input]')

  if (!input) {
    return
  }

  input.value = value
  picker.dataset.calendarMonth = value.slice(0, 7)
  renderDatePickerCalendar(picker, language)
}

function closeDatePickers(exceptPicker = null) {
  document.querySelectorAll('[data-date-picker]').forEach((picker) => {
    if (picker === exceptPicker) {
      return
    }

    picker.classList.remove('is-open')
    picker.querySelector('[data-date-picker-toggle]')?.setAttribute('aria-expanded', 'false')
  })
}

function closeDatePicker(picker) {
  picker?.classList.remove('is-open')
  picker?.querySelector('[data-date-picker-toggle]')?.setAttribute('aria-expanded', 'false')
}

function formatRoundMeta(round, language) {
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const teeLabel = scoreTool.teeOptions?.[round.tee]?.[language] || round.tee || ''
  const formatLabel = scoreTool.formatOptions?.[round.format]?.[language] || round.format || ''

  return [teeLabel, formatLabel].filter(Boolean).join(' • ')
}

function setTodayAsDefaultRoundDate(tool) {
  const dateInput = tool.querySelector('[data-round-date]')

  if (!dateInput || dateInput.value) {
    const picker = dateInput?.closest('[data-date-picker]')

    if (picker) {
      renderDatePickerCalendar(picker, getLanguage())
    }

    return
  }

  dateInput.value = toDateValue(new Date())

  const picker = dateInput.closest('[data-date-picker]')

  if (picker) {
    renderDatePickerCalendar(picker, getLanguage())
  }
}

function initializeDatePickers(container) {
  container.querySelectorAll('[data-date-picker]').forEach((picker) => {
    const input = picker.querySelector('[data-date-input]')

    if (input && !input.value) {
      input.value = toDateValue(new Date())
    }

    renderDatePickerCalendar(picker, getLanguage())
  })
}

function renderScoresState(tool, rounds, language) {
  const pointsCount = tool.querySelector('[data-points-count]')
  const roundsCount = tool.querySelector('[data-rounds-count]')
  const roundList = tool.querySelector('[data-round-list]')
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const points = rounds.length
  const isExpanded = roundList?.classList.contains('is-expanded')

  if (pointsCount) {
    pointsCount.textContent = String(points)
  }

  if (roundsCount) {
    roundsCount.textContent = String(rounds.length)
  }

  if (!roundList) {
    return
  }

  if (rounds.length === 0) {
    roundList.innerHTML = `<p>${roundList.dataset.emptyLabel || ''}</p>`
    return
  }

  roundList.innerHTML = `
    <ul>
      ${rounds.map((round, index) => `
        <li>
          <strong>${SCORE_COPY[language].scorePrefix} ${round.score}</strong>
          <span>${formatRoundDate(round.roundDate, language)}</span>
          <span>${formatRoundMeta(round, language)}</span>
          <small>+1 ${SCORE_COPY[language].pointsSuffix}</small>
        </li>
      `).join('')}
    </ul>
    ${rounds.length > 5 ? `
      <button class="round-list-toggle" type="button" data-round-list-toggle aria-expanded="${isExpanded ? 'true' : 'false'}">
        <span>${isExpanded ? scoreTool.showLatest[language] : scoreTool.showAll[language]}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>
    ` : ''}
  `

  roundList.classList.toggle('is-expanded', Boolean(isExpanded))
}

async function loadScores(tool, language) {
  const status = tool.querySelector('[data-score-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/scores.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || SCORE_COPY[language].loadError)
    }

    renderScoresState(tool, result.rounds || [], language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || SCORE_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializeScoresTool(language) {
  const tool = document.querySelector('[data-scores-tool]')

  if (!tool) {
    return
  }

  setTodayAsDefaultRoundDate(tool)
  loadScores(tool, language)
}

async function handleScoreSubmit(form) {
  const tool = form.closest('[data-scores-tool]')
  const language = getLanguage()
  const status = form.querySelector('[data-score-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = siteContent.pageMap.get('scores').scoreTool.saveMessage[language]
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/scores.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || SCORE_COPY[language].saveError)
    }

    form.reset()
    setTodayAsDefaultRoundDate(tool)
    renderScoresState(tool, result.rounds || [], language)
    closeDatePickers()

    if (status) {
      status.textContent = SCORE_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || SCORE_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function formatPointAmount(points, language) {
  const absolutePoints = Math.abs(Number(points) || 0)
  const suffix = absolutePoints === 1 ? POINTS_COPY[language].pointSingular : POINTS_COPY[language].pointPlural
  const sign = points > 0 ? '+' : ''

  return `${sign}${points} ${suffix}`
}

function renderPointsState(tool, result, language) {
  const balance = Number(result.balance) || 0
  const balanceEl = tool.querySelector('[data-points-balance]')
  const cashoutInput = tool.querySelector('[data-cashout-points]')
  const pointsList = tool.querySelector('[data-points-list]')
  const cashoutRequestsList = tool.querySelector('[data-cashout-requests]')
  const pendingCashouts = (result.cashoutRequests || []).filter((request) => request.status === 'REQUESTED')
  const pendingTotal = pendingCashouts.reduce((total, request) => total + (Number(request.points) || 0), 0)
  const availableBalance = Math.max(0, balance - pendingTotal)

  if (balanceEl) {
    balanceEl.textContent = String(balance)
  }

  if (cashoutInput) {
    cashoutInput.max = String(Math.max(availableBalance, 1))
  }

  if (cashoutRequestsList) {
    cashoutRequestsList.innerHTML = pendingCashouts.length ? `
      <h3>${POINTS_COPY[language].pendingCashouts}</h3>
      <ul>
        ${pendingCashouts.map((request) => `
          <li>
            <div>
              <strong>${POINTS_COPY[language].requested} ${formatPointAmount(-1 * Number(request.points || 0), language)}</strong>
              <span>${formatRoundDate(String(request.requestedAt || '').slice(0, 10), language)}</span>
            </div>
            <small class="is-negative">${formatPointAmount(-1 * Number(request.points || 0), language)}</small>
          </li>
        `).join('')}
      </ul>
    ` : ''
  }

  if (!pointsList) {
    return
  }

  const entries = result.entries || []

  if (entries.length === 0) {
    pointsList.innerHTML = `<p>${pointsList.dataset.emptyLabel || ''}</p>`
    return
  }

  pointsList.innerHTML = `
    <ul>
      ${entries.map((entry) => {
        const typeLabel = POINTS_COPY[language].types[entry.type] || entry.type
        const amountClass = entry.points < 0 ? 'is-negative' : 'is-positive'
        const rowClass = entry.points < 0 ? 'is-negative-entry' : ''

        return `
          <li class="${rowClass}">
            <div>
              <strong>${entry.description || typeLabel}</strong>
              <span>${typeLabel} - ${formatRoundDate(entry.date, language)}</span>
            </div>
            <small class="${amountClass}">${formatPointAmount(entry.points, language)}</small>
          </li>
        `
      }).join('')}
    </ul>
  `
}

async function loadPoints(tool, language) {
  const status = tool.querySelector('[data-points-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/points.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || POINTS_COPY[language].loadError)
    }

    renderPointsState(tool, result, language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || POINTS_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializePointsTool(language) {
  const tool = document.querySelector('[data-points-tool]')

  if (!tool) {
    return
  }

  loadPoints(tool, language)
}

async function handleCashoutSubmit(form) {
  const tool = form.closest('[data-points-tool]')
  const language = getLanguage()
  const status = tool.querySelector('[data-points-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = siteContent.pageMap.get('points').pointsTool.saving[language]
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/points.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || POINTS_COPY[language].saveError)
    }

    form.reset()
    form.classList.add('is-hidden')
    renderPointsState(tool, result, language)

    if (status) {
      status.textContent = result.message || POINTS_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || POINTS_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function formatEventDateTime(event, language) {
  const dateLabel = formatEventDate(event.eventDate, language)
  const [hours = '0', minutes = '00'] = String(event.eventTime || '00:00').split(':')
  const date = new Date(`${event.eventDate}T${hours.padStart(2, '0')}:${minutes}`)

  if (Number.isNaN(date.getTime())) {
    return `${dateLabel} ${event.eventTime || ''}`.trim()
  }

  const timeLabel = new Intl.DateTimeFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)

  return `${dateLabel} • ${timeLabel}`
}

function formatCurrency(value, language) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

function pathAllowsCurrentMember(path) {
  const memberType = String(currentMember?.membershipType || '').toUpperCase()

  if (path === 'EVERYONE') {
    return ['CUP', 'COMMUNITY'].includes(memberType)
  }

  return memberType === path
}

function pathOnlyLabel(copy, path) {
  return copy.pathOnlyLabels?.[path] || copy.pathLabels?.[path] || path
}

function ageRangeLabel(minAge, maxAge, language, copy = FIND_GAME_COPY[language]) {
  const min = Number(minAge || 0)
  const max = Number(maxAge || 0)

  if (min > 0 && max > 0) {
    return min === max ? `${copy.age} ${min}` : `${copy.ages} ${min}-${max}`
  }

  if (min > 0) {
    return `${copy.age} ${min}+`
  }

  if (max > 0) {
    return language === 'fr' ? `${copy.age} ${max} et moins` : `${copy.age} ${max} and under`
  }

  return copy.ageAny
}

function renderEventCollection(container, events, language, title = '', options = {}) {
  if (!container) {
    return
  }

  const showJoin = Boolean(options.showJoin)
  const showWinner = Boolean(options.showWinner)
  const showAdminActions = Boolean(options.showAdminActions)

  if (!events.length) {
    container.innerHTML = `${title ? `<h3>${title}</h3>` : ''}<p>${container.dataset.emptyLabel || ''}</p>`
    return
  }

  container.innerHTML = `
    ${title ? `<h3>${title}</h3>` : ''}
    <ul>
      ${events.map((event) => {
        const attendees = Array.isArray(event.attendees) ? event.attendees : []
        const maxPlayers = Number(event.maxPlayers || 0)
        const spotsRemaining = event.spotsRemaining === null || event.spotsRemaining === undefined
          ? null
          : Number(event.spotsRemaining)
        const isFull = maxPlayers > 0 && spotsRemaining <= 0
        const winner = String(event.winner || '').trim()
        const eventPath = String(event.eventPath || 'EVERYONE')
        const canJoinPath = pathAllowsCurrentMember(eventPath)
        const ageLabel = ageRangeLabel(event.minAge, event.maxAge, language, EVENTS_COPY[language])
        const canJoinAge = event.isAgeEligible !== false
        const joinLabel = !canJoinPath
          ? pathOnlyLabel(EVENTS_COPY[language], eventPath)
          : !canJoinAge ? ageLabel
          : isFull ? EVENTS_COPY[language].full : EVENTS_COPY[language].join
        const communityCost = Number(event.communityCost || 0)
        const costLabel = eventPath === 'CUP'
          ? ''
          : `${EVENTS_COPY[language].communityCost}: ${formatCurrency(communityCost, language)}`

        return `
          <li>
            <div class="event-card-main">
              <strong>${escapeHtml(event.eventName || formatEventDateTime(event, language))}</strong>
              <span>${escapeHtml(formatEventDateTime(event, language))}</span>
              <span>${EVENTS_COPY[language].location}: ${escapeHtml(event.location)}</span>
              <span>${EVENTS_COPY[language].path}: ${EVENTS_COPY[language].pathLabels[eventPath] || eventPath}</span>
              <span>${EVENTS_COPY[language].age}: ${escapeHtml(ageLabel)}</span>
              ${costLabel ? `<span>${escapeHtml(costLabel)}</span>` : ''}
              ${event.description ? `<p class="event-card-description">${escapeHtml(event.description)}</p>` : ''}
              ${showWinner && winner ? `<span>${EVENTS_COPY[language].winner}: ${escapeHtml(winner)}</span>` : ''}
            </div>
            <div class="event-card-points">
              <span>${Number(event.winnerPoints || 0)} ${EVENTS_COPY[language].points} winner</span>
              <span>${Number(event.participantPoints || 0)} ${EVENTS_COPY[language].points} participant</span>
              ${maxPlayers > 0 ? `<span class="event-spots">${Math.max(0, spotsRemaining)} ${EVENTS_COPY[language].spotsOpen}</span>` : ''}
              ${showAdminActions ? `
                <button
                  class="event-join-button"
                  type="button"
                  data-event-edit
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].edit}</button>
                <button
                  class="event-join-button is-danger"
                  type="button"
                  data-event-action="delete_event"
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].remove}</button>
              ` : showJoin ? event.isJoined ? `
                <button
                  class="event-join-button is-secondary"
                  type="button"
                  data-event-action="leave"
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].leave}</button>
              ` : `
                <button
                  class="event-join-button"
                  type="button"
                  data-event-action="join"
                  data-event-id="${Number(event.id || 0)}"
                  ${(isFull || !canJoinPath || !canJoinAge) ? 'disabled' : ''}
                >${joinLabel}</button>
              ` : ''}
            </div>
            <div class="event-attendees">
              <strong>${EVENTS_COPY[language].attending}</strong>
              ${attendees.length ? `
                <ul>
                  ${attendees.map((attendee) => `<li>${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}</li>`).join('')}
                </ul>
              ` : `<p>${EVENTS_COPY[language].noAttendees}</p>`}
            </div>
          </li>
        `
      }).join('')}
    </ul>
  `
}

function renderEventsState(tool, result, language) {
  const allEvents = [...(result.upcoming || []), ...(result.past || [])]
  const canManageEvents = ['ADMIN', 'TEACHER'].includes(currentMember?.membershipType)
  const showAdminActions = canManageEvents && isEventAdminModeOpen
  const adminPanel = tool.querySelector('[data-event-admin-panel]')
  const adminToggle = tool.querySelector('[data-event-admin-toggle]')

  currentEventsById = new Map(allEvents.map((event) => [String(event.id), event]))
  adminPanel?.classList.toggle('is-hidden', !showAdminActions)

  if (adminToggle) {
    adminToggle.textContent = isEventAdminModeOpen
      ? adminToggle.dataset.hideLabel
      : adminToggle.dataset.showLabel
    adminToggle.setAttribute('aria-expanded', String(isEventAdminModeOpen))
  }

  renderEventCollection(tool.querySelector('[data-upcoming-events]'), result.upcoming || [], language, '', {
    showAdminActions,
    showJoin: !showAdminActions,
  })
  renderEventCollection(
    tool.querySelector('[data-past-events]'),
    result.past || [],
    language,
    tool.querySelector('[data-past-events]')?.dataset.title || '',
    {
      showAdminActions,
      showWinner: true,
    },
  )
}

function renderFindGamesState(tool, games, language) {
  const list = tool.querySelector('[data-find-game-list]')

  if (!list) {
    return
  }

  if (!games.length) {
    list.innerHTML = `<p>${list.dataset.emptyLabel || ''}</p>`
    return
  }

  list.innerHTML = `
    <ul>
      ${games.map((game) => {
        const players = Array.isArray(game.players) ? game.players : []
        const currentMemberId = Number(currentMember?.id || currentMember?.sub || 0)
        const spotsRemaining = Number(game.spotsRemaining || 0)
        const isFull = spotsRemaining <= 0
        const isPoster = Number(game.createdByMemberId || 0) === currentMemberId
        const gamePath = String(game.gamePath || 'EVERYONE')
        const canJoinPath = pathAllowsCurrentMember(gamePath)
        const ageLabel = ageRangeLabel(game.minAge, game.maxAge, language, FIND_GAME_COPY[language])
        const canJoinAge = game.isAgeEligible !== false
        const buttonLabel = game.isJoined
          ? isPoster ? FIND_GAME_COPY[language].joined : FIND_GAME_COPY[language].leave
          : !canJoinPath ? pathOnlyLabel(FIND_GAME_COPY[language], gamePath)
            : !canJoinAge ? ageLabel
            : isFull ? FIND_GAME_COPY[language].full : FIND_GAME_COPY[language].join

        return `
          <li class="${isFull ? 'is-full' : ''}">
            <div class="event-card-main">
              <strong>${escapeHtml(formatEventDateTime({
                eventDate: game.gameDate,
                eventTime: game.gameTime,
              }, language))}</strong>
              <span>${FIND_GAME_COPY[language].location}: ${escapeHtml(game.location)}</span>
              <span>${FIND_GAME_COPY[language].path}: ${FIND_GAME_COPY[language].pathLabels[gamePath] || gamePath}</span>
              <span>${FIND_GAME_COPY[language].age}: ${escapeHtml(ageLabel)}</span>
              <p class="event-card-description">${escapeHtml(game.roundDetails)}</p>
            </div>
            <div class="event-card-points">
              <span class="event-spots">${spotsRemaining} ${FIND_GAME_COPY[language].spotsOpen}</span>
              <button
                class="event-join-button ${game.isJoined ? 'is-secondary' : ''}"
                type="button"
                data-find-game-action="${game.isJoined ? 'leave' : 'join'}"
                data-game-id="${Number(game.id || 0)}"
                ${(isPoster || (!game.isJoined && (isFull || !canJoinPath || !canJoinAge))) ? 'disabled' : ''}
              >${buttonLabel}</button>
            </div>
            <div class="event-attendees">
              <strong>${FIND_GAME_COPY[language].playing}</strong>
              ${players.length ? `
                <ul>
                  ${players.map((player) => `<li>${memberNameHtml(player.name || player.username || '', player.membershipType)}</li>`).join('')}
                </ul>
              ` : `<p>${FIND_GAME_COPY[language].playing}</p>`}
            </div>
          </li>
        `
      }).join('')}
    </ul>
  `
}

async function loadFindGames(tool, language) {
  const status = tool.querySelector('[data-find-game-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/find-games.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || FIND_GAME_COPY[language].loadError)
    }

    renderFindGamesState(tool, result.games || [], language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || FIND_GAME_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializeFindGameTool(language) {
  const tool = document.querySelector('[data-find-game-tool]')

  if (!tool) {
    return
  }

  initializeDatePickers(tool)
  loadFindGames(tool, language)
}

function lessonTypeLabel(type, language) {
  return type === 'GROUP' ? LESSON_COPY[language].group : LESSON_COPY[language].single
}

function renderLessonsState(tool, result, language) {
  const bookedContainer = tool.querySelector('[data-lesson-booked]')
  const slotsContainer = tool.querySelector('[data-lesson-slots]')
  const requestsContainer = tool.querySelector('[data-lesson-requests]')
  const currentMemberId = Number(currentMember?.id || currentMember?.sub || 0)
  const canTeach = ['ADMIN', 'TEACHER'].includes(currentMember?.membershipType)
  const canJoinLesson = ['CUP', 'COMMUNITY'].includes(currentMember?.membershipType)
  const booked = result.booked || []
  const slots = result.slots || []
  const requests = result.requests || []

  if (bookedContainer) {
    bookedContainer.innerHTML = booked.length ? `
      <ul>
        ${booked.map((slot) => {
          const students = Array.isArray(slot.students) ? slot.students : []
          const isProvider = Number(slot.providerMemberId || 0) === currentMemberId
          const canDeleteSlot = canTeach && isProvider && students.length === 0
          const lessonPath = String(slot.lessonPath || 'EVERYONE')
          const ageLabel = ageRangeLabel(slot.minAge, slot.maxAge, language, LESSON_COPY[language])

          return `
            <li class="is-booked">
              <div class="event-card-main">
                <strong>${escapeHtml(formatEventDateTime({ eventDate: slot.lessonDate, eventTime: slot.lessonTime }, language))}</strong>
                <span>${LESSON_COPY[language].provider}: ${memberNameHtml(slot.providerName, slot.providerMembershipType)}</span>
                <span>${lessonTypeLabel(slot.lessonType, language)} • ${LESSON_COPY[language].max}: ${Number(slot.maxStudents || 1)}</span>
                <span>${LESSON_COPY[language].path}: ${LESSON_COPY[language].pathLabels[lessonPath] || lessonPath}</span>
                <span>${LESSON_COPY[language].age}: ${escapeHtml(ageLabel)}</span>
                <span>${LESSON_COPY[language].location}: ${escapeHtml(slot.location)}</span>
                ${slot.notes ? `<p class="event-card-description">${escapeHtml(slot.notes)}</p>` : ''}
              </div>
              <div class="event-card-points">
                <span class="event-spots">${Number(slot.spotsRemaining || 0)} ${LESSON_COPY[language].spotsOpen}</span>
                ${canDeleteSlot ? `<button
                  class="event-join-button is-secondary"
                  type="button"
                  data-lesson-slot-action="delete_slot"
                  data-slot-id="${Number(slot.id || 0)}"
                >${LESSON_COPY[language].delete}</button>` : ''}
              </div>
              <div class="event-attendees">
                <strong>${LESSON_COPY[language].students}</strong>
                ${students.length ? `<ul>${students.map((student) => `<li>${memberNameHtml(student.name || student.username || '', student.membershipType)}</li>`).join('')}</ul>` : `<p>${bookedContainer.dataset.emptyLabel || ''}</p>`}
              </div>
            </li>
          `
        }).join('')}
      </ul>
    ` : `<p>${bookedContainer.dataset.emptyLabel || ''}</p>`
  }

  if (slotsContainer) {
    slotsContainer.innerHTML = slots.length ? `
      <ul>
        ${slots.map((slot) => {
          const students = Array.isArray(slot.students) ? slot.students : []
          const isFull = Number(slot.spotsRemaining || 0) <= 0
          const isProvider = Number(slot.providerMemberId || 0) === currentMemberId
          const lessonPath = String(slot.lessonPath || 'EVERYONE')
          const canJoinPath = pathAllowsCurrentMember(lessonPath)
          const ageLabel = ageRangeLabel(slot.minAge, slot.maxAge, language, LESSON_COPY[language])
          const canJoinAge = slot.isAgeEligible !== false
          const buttonLabel = slot.isJoined
            ? LESSON_COPY[language].leave
            : !canJoinPath ? pathOnlyLabel(LESSON_COPY[language], lessonPath)
              : !canJoinAge ? ageLabel
              : isFull ? LESSON_COPY[language].full : LESSON_COPY[language].join

          return `
            <li class="${isFull ? 'is-full' : ''}">
              <div class="event-card-main">
                <strong>${escapeHtml(formatEventDateTime({ eventDate: slot.lessonDate, eventTime: slot.lessonTime }, language))}</strong>
                <span>${LESSON_COPY[language].provider}: ${memberNameHtml(slot.providerName, slot.providerMembershipType)}</span>
                <span>${lessonTypeLabel(slot.lessonType, language)} • ${LESSON_COPY[language].max}: ${Number(slot.maxStudents || 1)}</span>
                <span>${LESSON_COPY[language].path}: ${LESSON_COPY[language].pathLabels[lessonPath] || lessonPath}</span>
                <span>${LESSON_COPY[language].age}: ${escapeHtml(ageLabel)}</span>
                <span>${LESSON_COPY[language].location}: ${escapeHtml(slot.location)}</span>
                ${slot.notes ? `<p class="event-card-description">${escapeHtml(slot.notes)}</p>` : ''}
              </div>
              <div class="event-card-points">
                <span class="event-spots">${Number(slot.spotsRemaining || 0)} ${LESSON_COPY[language].spotsOpen}</span>
                <button
                  class="event-join-button ${slot.isJoined ? 'is-secondary' : ''}"
                  type="button"
                  data-lesson-slot-action="${slot.isJoined ? 'leave_slot' : 'join_slot'}"
                  data-slot-id="${Number(slot.id || 0)}"
                  ${(!canJoinLesson || isProvider || (!slot.isJoined && (isFull || !canJoinPath || !canJoinAge))) ? 'disabled' : ''}
                >${isProvider ? LESSON_COPY[language].joined : buttonLabel}</button>
              </div>
              <div class="event-attendees">
                <strong>${LESSON_COPY[language].students}</strong>
                ${students.length ? `<ul>${students.map((student) => `<li>${memberNameHtml(student.name || student.username || '', student.membershipType)}</li>`).join('')}</ul>` : `<p>${slotsContainer.dataset.emptyLabel || ''}</p>`}
              </div>
            </li>
          `
        }).join('')}
      </ul>
    ` : `<p>${slotsContainer.dataset.emptyLabel || ''}</p>`
  }

  if (requestsContainer) {
    requestsContainer.innerHTML = requests.length ? `
      <ul>
        ${requests.map((request) => {
          const isRequester = Number(request.requesterMemberId || 0) === currentMemberId
          const isAccepted = Boolean(request.acceptedByMemberId)
          const lessonPath = String(request.lessonPath || request.requesterMembershipType || 'EVERYONE')

          return `
            <li class="${isAccepted ? 'is-full' : ''}">
              <div class="event-card-main">
                <strong>${escapeHtml(formatEventDateTime({ eventDate: request.preferredDate, eventTime: request.preferredTime }, language))}</strong>
                <span>${LESSON_COPY[language].requester}: ${memberNameWithPathHtml(request.requesterName, request.requesterMembershipType)}</span>
                <span>${lessonTypeLabel(request.lessonType, language)} • ${LESSON_COPY[language].max}: ${Number(request.maxStudents || 1)}</span>
                <span>${LESSON_COPY[language].path}: ${LESSON_COPY[language].pathLabels[lessonPath] || lessonPath}</span>
                ${request.notes ? `<p class="event-card-description">${escapeHtml(request.notes)}</p>` : ''}
                ${isAccepted ? `<span>${LESSON_COPY[language].accepted}: ${memberNameHtml(request.acceptedByName, request.acceptedByMembershipType)}</span>` : ''}
              </div>
              <div class="event-card-points">
                ${isRequester && !isAccepted ? `<button
                  class="event-join-button is-secondary"
                  type="button"
                  data-lesson-request-action="delete_request"
                  data-request-id="${Number(request.id || 0)}"
                >${LESSON_COPY[language].delete}</button>` : `<button
                  class="event-join-button ${isAccepted ? 'is-secondary' : ''}"
                  type="button"
                  data-lesson-request-action="accept_request"
                  data-request-id="${Number(request.id || 0)}"
                  ${(!canTeach || isRequester || isAccepted) ? 'disabled' : ''}
                >${isAccepted ? LESSON_COPY[language].accepted : LESSON_COPY[language].accept}</button>`}
              </div>
            </li>
          `
        }).join('')}
      </ul>
    ` : `<p>${requestsContainer.dataset.emptyLabel || ''}</p>`
  }
}

async function loadLessons(tool, language) {
  const status = tool.querySelector('[data-lesson-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || LESSON_COPY[language].loadError)
    }

    renderLessonsState(tool, result, language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || LESSON_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializeLessonTool(language) {
  const tool = document.querySelector('[data-lesson-tool]')

  if (!tool) {
    return
  }

  initializeDatePickers(tool)
  loadLessons(tool, language)
}

async function loadEvents(tool, language) {
  const status = tool.querySelector('[data-events-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/events.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || EVENTS_COPY[language].loadError)
    }

    renderEventsState(tool, result, language)

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || EVENTS_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializeEventsTool(language) {
  const tool = document.querySelector('[data-events-tool]')

  if (!tool) {
    return
  }

  isEventAdminModeOpen = false
  initializeDatePickers(tool)
  loadEvents(tool, language)
}

function resetEventForm(form) {
  if (!form) {
    return
  }

  const actionInput = form.querySelector('input[name="action"]')
  const eventIdInput = form.querySelector('input[name="event_id"]')
  const title = form.querySelector('[data-event-form-title]')
  const submitButton = form.querySelector('[data-event-submit]')
  const cancelButton = form.querySelector('[data-event-cancel-edit]')
  const locationInput = form.querySelector('input[name="location"]')

  form.reset()

  if (actionInput) {
    actionInput.value = 'add_event'
  }

  if (eventIdInput) {
    eventIdInput.value = ''
  }

  if (locationInput) {
    locationInput.value = 'Hawkesbury'
  }

  if (title) {
    title.textContent = title.dataset.addTitle || title.textContent
  }

  if (submitButton) {
    submitButton.textContent = submitButton.dataset.saveLabel || submitButton.textContent
  }

  cancelButton?.classList.add('is-hidden')
  initializeDatePickers(form)
}

function editEventFromList(button) {
  const event = currentEventsById.get(String(button.dataset.eventId))
  const tool = button.closest('[data-events-tool]')
  const form = tool?.querySelector('[data-event-form]')

  if (!event || !form) {
    return
  }

  const actionInput = form.querySelector('input[name="action"]')
  const eventIdInput = form.querySelector('input[name="event_id"]')
  const dateInput = form.querySelector('input[name="event_date"]')
  const title = form.querySelector('[data-event-form-title]')
  const submitButton = form.querySelector('[data-event-submit]')
  const cancelButton = form.querySelector('[data-event-cancel-edit]')

  if (actionInput) {
    actionInput.value = 'update_event'
  }

  if (eventIdInput) {
    eventIdInput.value = event.id
  }

  if (dateInput) {
    dateInput.value = event.eventDate || ''
  }

  form.querySelector('input[name="event_name"]').value = event.eventName || ''
  form.querySelector('input[name="event_time"]').value = event.eventTime || ''
  form.querySelector('input[name="winner_points"]').value = Number(event.winnerPoints || 0)
  form.querySelector('input[name="participant_points"]').value = Number(event.participantPoints || 0)
  form.querySelector('input[name="max_players"]').value = Number(event.maxPlayers || 1)
  form.querySelector('select[name="event_path"]').value = event.eventPath || 'EVERYONE'
  form.querySelector('input[name="min_age"]').value = event.minAge || ''
  form.querySelector('input[name="max_age"]').value = event.maxAge || ''
  form.querySelector('input[name="community_cost"]').value = Number(event.communityCost || 0).toFixed(2)
  form.querySelector('input[name="location"]').value = event.location || 'Hawkesbury'
  form.querySelector('textarea[name="description"]').value = event.description || ''
  form.querySelector('input[name="winner"]').value = event.winner || ''
  form.querySelector('textarea[name="attendee_csv"]').value = event.attendeeCsv || ''

  if (title) {
    title.textContent = title.dataset.editTitle || title.textContent
  }

  if (submitButton) {
    submitButton.textContent = submitButton.dataset.updateLabel || submitButton.textContent
  }

  cancelButton?.classList.remove('is-hidden')

  const picker = dateInput?.closest('[data-date-picker]')

  if (picker && dateInput?.value) {
    updateDatePickerValue(picker, dateInput.value, getLanguage())
  }

  form.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function handleEventSubmit(form) {
  const tool = form.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool.querySelector('[data-events-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = siteContent.pageMap.get('events').eventsTool.saving[language]
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/events.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || EVENTS_COPY[language].saveError)
    }

    resetEventForm(form)
    renderEventsState(tool, result, language)

    if (status) {
      status.textContent = result.message || EVENTS_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || EVENTS_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

async function handleEventAction(button) {
  const tool = button.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-events-status]')
  const eventId = button.dataset.eventId
  const action = button.dataset.eventAction || 'join'
  const formData = new FormData()

  if (action === 'delete_event' && !window.confirm(EVENTS_COPY[language].removeConfirm)) {
    return
  }

  formData.append('action', action)
  formData.append('event_id', eventId)

  if (status) {
    status.textContent = siteContent.pageMap.get('events').eventsTool.saving[language]
    status.classList.remove('error', 'success')
  }

  button.disabled = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/events.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || EVENTS_COPY[language].saveError)
    }

    renderEventsState(tool, result, language)

    if (action === 'delete_event') {
      resetEventForm(tool?.querySelector('[data-event-form]'))
    }

    if (status) {
      status.textContent = result.message || EVENTS_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    button.disabled = false

    if (status) {
      status.textContent = error.message || EVENTS_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

async function handleFindGameSubmit(form) {
  const tool = form.closest('[data-find-game-tool]')
  const language = getLanguage()
  const status = tool.querySelector('[data-find-game-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = siteContent.pageMap.get('find-a-game').findGameTool.saving[language]
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/find-games.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || FIND_GAME_COPY[language].saveError)
    }

    form.reset()
    const locationInput = form.querySelector('input[name="location"]')

    if (locationInput) {
      locationInput.value = 'Hawkesbury'
    }

    initializeDatePickers(form)
    renderFindGamesState(tool, result.games || [], language)

    if (status) {
      status.textContent = result.message || FIND_GAME_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || FIND_GAME_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

async function handleFindGameAction(button) {
  const tool = button.closest('[data-find-game-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-find-game-status]')
  const formData = new FormData()

  formData.append('action', button.dataset.findGameAction || 'join')
  formData.append('game_id', button.dataset.gameId)

  if (status) {
    status.textContent = siteContent.pageMap.get('find-a-game').findGameTool.saving[language]
    status.classList.remove('error', 'success')
  }

  button.disabled = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/find-games.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || FIND_GAME_COPY[language].saveError)
    }

    renderFindGamesState(tool, result.games || [], language)

    if (status) {
      status.textContent = result.message || FIND_GAME_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    button.disabled = false

    if (status) {
      status.textContent = error.message || FIND_GAME_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

async function handleLessonSubmit(form) {
  const tool = form.closest('[data-lesson-tool]')
  const language = getLanguage()
  const status = tool.querySelector('[data-lesson-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)

  if (status) {
    status.textContent = siteContent.pageMap.get('book-a-lesson').lessonTool.saving[language]
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || LESSON_COPY[language].saveError)
    }

    form.reset()
    form.querySelector('input[name="location"]') && (form.querySelector('input[name="location"]').value = 'Hawkesbury')
    initializeDatePickers(form)
    renderLessonsState(tool, result, language)

    if (status) {
      status.textContent = result.message || LESSON_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || LESSON_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

async function handleLessonAction(button) {
  const tool = button.closest('[data-lesson-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-lesson-status]')
  const formData = new FormData()
  const slotAction = button.dataset.lessonSlotAction
  const requestAction = button.dataset.lessonRequestAction

  formData.append('action', slotAction || requestAction)

  if (slotAction) {
    formData.append('slot_id', button.dataset.slotId)
  }

  if (requestAction) {
    formData.append('request_id', button.dataset.requestId)
  }

  if (status) {
    status.textContent = siteContent.pageMap.get('book-a-lesson').lessonTool.saving[language]
    status.classList.remove('error', 'success')
  }

  button.disabled = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons.php`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || LESSON_COPY[language].saveError)
    }

    renderLessonsState(tool, result, language)

    if (status) {
      status.textContent = result.message || LESSON_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    button.disabled = false

    if (status) {
      status.textContent = error.message || LESSON_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

document.addEventListener('click', (event) => {
  const datePickerToggle = event.target.closest('[data-date-picker-toggle]')

  if (datePickerToggle) {
    event.preventDefault()
    const picker = datePickerToggle.closest('[data-date-picker]')
    const isOpen = picker.classList.toggle('is-open')

    closeDatePickers(picker)
    datePickerToggle.setAttribute('aria-expanded', String(isOpen))
    renderDatePickerCalendar(picker, getLanguage())
    return
  }

  const calendarDate = event.target.closest('[data-calendar-date]')

  if (calendarDate) {
    event.preventDefault()
    const picker = calendarDate.closest('[data-date-picker]')

    updateDatePickerValue(picker, calendarDate.dataset.calendarDate, getLanguage())
    closeDatePicker(picker)
    return
  }

  const calendarPrev = event.target.closest('[data-calendar-prev]')
  const calendarNext = event.target.closest('[data-calendar-next]')

  if (calendarPrev || calendarNext) {
    event.preventDefault()
    const picker = event.target.closest('[data-date-picker]')
    const currentMonth = getDateFromValue(`${picker.dataset.calendarMonth}-01`)
    currentMonth.setMonth(currentMonth.getMonth() + (calendarNext ? 1 : -1))
    picker.dataset.calendarMonth = toDateValue(currentMonth).slice(0, 7)
    renderDatePickerCalendar(picker, getLanguage())
    return
  }

  if (!event.target.closest('[data-date-picker]')) {
    closeDatePickers()
  }

  const button = event.target.closest('[data-language]')

  if (button) {
    setLanguage(button.dataset.language)
    return
  }

  const menuToggle = event.target.closest('.menu-toggle')

  if (menuToggle) {
    const header = menuToggle.closest('.site-header')
    const isOpen = header.classList.toggle('menu-open')

    menuToggle.setAttribute('aria-expanded', String(isOpen))
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation')
    return
  }

  const logoutButton = event.target.closest('[data-account-logout]')

  if (logoutButton) {
    logMemberOut()
    return
  }

  const sessionModeLink = event.target.closest('[data-session-mode-link]')

  if (sessionModeLink) {
    event.preventDefault()
    handleSessionModeLink(sessionModeLink)
    return
  }

  const adminToggle = event.target.closest('[data-admin-toggle]')

  if (adminToggle) {
    const panel = document.querySelector('[data-admin-panel]')
    const isHidden = panel?.classList.toggle('is-hidden')

    adminToggle.setAttribute('aria-expanded', String(!isHidden))
    return
  }

  const adminTextOpen = event.target.closest('[data-admin-text-open]')

  if (adminTextOpen) {
    const panel = adminTextOpen.closest('[data-admin-panel]')

    setAdminTextModalOpen(panel, true)
    return
  }

  const adminTextClose = event.target.closest('[data-admin-text-close]')

  if (adminTextClose) {
    const panel = adminTextClose.closest('[data-admin-panel]')

    setAdminTextModalOpen(panel, false)
    return
  }

  const adminTextModal = event.target.closest('[data-admin-text-modal]')

  if (adminTextModal && event.target === adminTextModal) {
    const panel = adminTextModal.closest('[data-admin-panel]')

    setAdminTextModalOpen(panel, false)
    return
  }

  const adminFilter = event.target.closest('[data-admin-filter]')

  if (adminFilter) {
    const panel = adminFilter.closest('[data-admin-panel]')
    const language = getLanguage()

    currentAdminFilter = adminFilter.dataset.adminFilter || 'staff'
    renderAdminMembers(panel, currentAdminMembers, language)
    return
  }

  const adminPointsToggle = event.target.closest('[data-admin-points-toggle]')

  if (adminPointsToggle) {
    const panel = adminPointsToggle.closest('[data-admin-panel]')
    const memberId = Number(adminPointsToggle.dataset.memberId || 0)

    const isClosing = expandedAdminMemberId === memberId
    expandedAdminMemberId = isClosing ? null : memberId
    currentAdminDetailTab = 'points'
    renderAdminMembers(panel, currentAdminMembers, getLanguage())
    return
  }

  const adminDetailTab = event.target.closest('[data-admin-detail-tab]')

  if (adminDetailTab) {
    const panel = adminDetailTab.closest('[data-admin-panel]')

    currentAdminDetailTab = adminDetailTab.dataset.adminDetailTab || 'points'
    renderAdminMembers(panel, currentAdminMembers, getLanguage())
    return
  }

  const adminPointsAll = event.target.closest('[data-admin-points-all]')

  if (adminPointsAll) {
    openAdminPointHistoryWindow(Number(adminPointsAll.dataset.memberId || 0), getLanguage())
    return
  }

  const accountTab = event.target.closest('[data-account-tab]')

  if (accountTab) {
    const panel = accountTab.closest('.login-panel')

    if (panel) {
      showAccountForm(panel, accountTab.dataset.accountTab)
    }

    return
  }

  const roundListToggle = event.target.closest('[data-round-list-toggle]')

  if (roundListToggle) {
    const roundList = roundListToggle.closest('[data-round-list]')
    const language = getLanguage()
    const scoreTool = siteContent.pageMap.get('scores').scoreTool
    const isExpanded = roundList.classList.toggle('is-expanded')
    const label = roundListToggle.querySelector('span')

    roundListToggle.setAttribute('aria-expanded', String(isExpanded))

    if (label) {
      label.textContent = isExpanded ? scoreTool.showLatest[language] : scoreTool.showAll[language]
    }

    return
  }

  const cashoutToggle = event.target.closest('[data-cashout-toggle]')

  if (cashoutToggle) {
    const tool = cashoutToggle.closest('[data-points-tool]')
    const form = tool?.querySelector('[data-cashout-form]')

    form?.classList.toggle('is-hidden')
    form?.querySelector('input[name="points"]')?.focus()
    return
  }

  const pastEventsToggle = event.target.closest('[data-past-events-toggle]')

  if (pastEventsToggle) {
    const tool = pastEventsToggle.closest('[data-events-tool]')
    const pastEvents = tool?.querySelector('[data-past-events]')
    const language = getLanguage()
    const eventsTool = siteContent.pageMap.get('events').eventsTool
    const isHidden = pastEvents?.classList.toggle('is-hidden')

    pastEventsToggle.textContent = isHidden ? eventsTool.pastButton[language] : eventsTool.hidePastButton[language]
    return
  }

  const findGamePostToggle = event.target.closest('[data-find-game-post-toggle]')

  if (findGamePostToggle) {
    const tool = findGamePostToggle.closest('[data-find-game-tool]')
    const form = tool?.querySelector('[data-find-game-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    findGamePostToggle.textContent = isHidden
      ? findGamePostToggle.dataset.showLabel
      : findGamePostToggle.dataset.hideLabel
    form?.querySelector('input[name="spots_open"]')?.focus()
    return
  }

  const findGameActionButton = event.target.closest('[data-find-game-action]')

  if (findGameActionButton) {
    event.preventDefault()
    handleFindGameAction(findGameActionButton)
    return
  }

  const lessonFormToggle = event.target.closest('[data-lesson-form-toggle]')

  if (lessonFormToggle) {
    const tool = lessonFormToggle.closest('[data-lesson-tool]')
    const target = lessonFormToggle.dataset.lessonFormToggle
    const availableForm = tool?.querySelector('[data-lesson-available-form]')
    const requestForm = tool?.querySelector('[data-lesson-request-form]')

    if (target === 'available') {
      const shouldOpen = availableForm?.classList.contains('is-hidden')
      requestForm?.classList.add('is-hidden')
      availableForm?.classList.toggle('is-hidden', !shouldOpen)
    } else {
      const shouldOpen = requestForm?.classList.contains('is-hidden')
      availableForm?.classList.add('is-hidden')
      requestForm?.classList.toggle('is-hidden', !shouldOpen)
    }

    return
  }

  const lessonActionButton = event.target.closest('[data-lesson-slot-action], [data-lesson-request-action]')

  if (lessonActionButton) {
    event.preventDefault()
    handleLessonAction(lessonActionButton)
    return
  }

  const eventAdminToggle = event.target.closest('[data-event-admin-toggle]')

  if (eventAdminToggle) {
    const tool = eventAdminToggle.closest('[data-events-tool]')
    const language = getLanguage()

    isEventAdminModeOpen = !isEventAdminModeOpen
    loadEvents(tool, language)
    return
  }

  const eventEditButton = event.target.closest('[data-event-edit]')

  if (eventEditButton) {
    event.preventDefault()
    editEventFromList(eventEditButton)
    return
  }

  const eventCancelEditButton = event.target.closest('[data-event-cancel-edit]')

  if (eventCancelEditButton) {
    event.preventDefault()
    resetEventForm(eventCancelEditButton.closest('[data-event-form]'))
    return
  }

  const eventActionButton = event.target.closest('[data-event-action]')

  if (eventActionButton) {
    event.preventDefault()
    handleEventAction(eventActionButton)
    return
  }

  const navLink = event.target.closest('.nav a')

  if (navLink) {
    const header = navLink.closest('.site-header')
    const toggle = header?.querySelector('.menu-toggle')

    header?.classList.remove('menu-open')
    toggle?.setAttribute('aria-expanded', 'false')
    toggle?.setAttribute('aria-label', 'Open navigation')
  }
})

document.addEventListener('submit', (event) => {
  const scoreForm = event.target.closest('[data-score-form]')

  if (scoreForm) {
    event.preventDefault()
    handleScoreSubmit(scoreForm)
    return
  }

  const cashoutForm = event.target.closest('[data-cashout-form]')

  if (cashoutForm) {
    event.preventDefault()
    handleCashoutSubmit(cashoutForm)
    return
  }

  const findGameForm = event.target.closest('[data-find-game-form]')

  if (findGameForm) {
    event.preventDefault()
    handleFindGameSubmit(findGameForm)
    return
  }

  const lessonForm = event.target.closest('[data-lesson-available-form], [data-lesson-request-form]')

  if (lessonForm) {
    event.preventDefault()
    handleLessonSubmit(lessonForm)
    return
  }

  const eventForm = event.target.closest('[data-event-form]')

  if (eventForm) {
    event.preventDefault()
    handleEventSubmit(eventForm)
    return
  }

  const accountProfileForm = event.target.closest('[data-account-profile-form]')

  if (accountProfileForm) {
    event.preventDefault()
    handleAccountProfileSubmit(accountProfileForm)
    return
  }

  const adminDeleteForm = event.target.closest('[data-admin-delete-form]')

  if (adminDeleteForm) {
    event.preventDefault()

    const action = adminDeleteForm.querySelector('input[name="action"]')?.value || ''

    if (action === 'activate_member' || window.confirm(ADMIN_COPY[getLanguage()].deleteConfirm)) {
      handleAdminMemberSubmit(adminDeleteForm)
    }

    return
  }

  const adminMemberForm = event.target.closest('[data-admin-member-form]')

  if (adminMemberForm) {
    event.preventDefault()
    handleAdminMemberSubmit(adminMemberForm)
    return
  }

  const adminCashoutForm = event.target.closest('[data-admin-cashout-form]')

  if (adminCashoutForm) {
    event.preventDefault()
    handleAdminMemberSubmit(adminCashoutForm)
    return
  }

  const adminTextForm = event.target.closest('[data-admin-text-form]')

  if (adminTextForm) {
    event.preventDefault()
    handleAdminTextSubmit(adminTextForm)
    return
  }

  const adminAwardForm = event.target.closest('[data-admin-award-form]')

  if (adminAwardForm) {
    event.preventDefault()
    handleAdminMemberSubmit(adminAwardForm)
    return
  }

  const form = event.target.closest('[data-account-form]')

  if (!form) {
    return
  }

  event.preventDefault()
  handleAccountSubmit(form)
})

document.addEventListener('input', (event) => {
  const playerAge = event.target.closest('[data-player-age]')

  if (playerAge) {
    updatePlayerTextField(playerAge)
  }
})

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredInstallPrompt = event
})

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null
})

if ('serviceWorker' in navigator) {
  const registerServiceWorker = () => navigator.serviceWorker.register('/sw.js').catch(() => null)

  if (document.readyState === 'complete') {
    registerServiceWorker()
  } else {
    window.addEventListener('load', registerServiceWorker)
  }
}

window.addEventListener('hashchange', render)
await checkMemberSession()
render()
