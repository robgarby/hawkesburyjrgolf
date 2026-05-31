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
    holes: 'Holes',
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
    addPlayer: 'Add Player to Event',
    hideAddPlayer: 'Hide Add Player',
    admin: 'Admin',
    hideAdmin: 'Hide Admin',
    teamName: 'Team Name',
    createTeam: 'Create Team',
    deleteTeam: 'Delete Team',
    eventFormat: 'Event Format',
    teamEvent: 'Team',
    individualEvent: 'Individual',
    liveCode: 'Live Code',
    teeTime: 'T-Time',
    publishTeams: 'Publish Event',
    unpublishTeams: 'Unpublish Event',
    teamsPublished: 'Event published',
    openRound: 'Open Round',
    standings: 'Standings',
    noStandings: 'No scores posted yet.',
    holes: 'Holes',
    editScore: 'Edit Score',
    updateScore: 'Update Score',
    unassigned: 'Unassigned',
    saveTeams: 'Save Team/Times',
    saveTTimes: 'Save T-Times',
    noTeamPlayers: 'No players here.',
    sendMessage: 'Send Message',
    hideMessage: 'Hide Message',
    messageLabel: 'Message',
    messagePlaceholder: 'Remember you are playing today at 3:30. Please be there on time.',
    sendEventMessage: 'Send message',
    player: 'Player',
    savePlayer: 'Save',
    noPlayers: 'No active juniors available.',
    path: 'Path',
    pathLabels: {
      CUP: 'Member Event',
      COMMUNITY: 'Community Event',
      EVERYONE: 'Both (Member and Community)',
    },
    pathOnlyLabels: {
      CUP: 'Member only',
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
    holes: 'Trous',
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
    addPlayer: 'Ajouter un joueur à l’événement',
    hideAddPlayer: 'Masquer l’ajout de joueur',
    admin: 'Admin',
    hideAdmin: 'Masquer Admin',
    teamName: 'Nom de l’équipe',
    createTeam: 'Créer équipe',
    deleteTeam: 'Supprimer équipe',
    eventFormat: 'Format',
    teamEvent: 'Équipe',
    individualEvent: 'Individuel',
    liveCode: 'Code direct',
    teeTime: 'Heure de départ',
    publishTeams: 'Publier événement',
    unpublishTeams: 'Dépublier événement',
    teamsPublished: 'Événement publié',
    openRound: 'Ouvrir ronde',
    standings: 'Classement',
    noStandings: 'Aucun score publié.',
    holes: 'Trous',
    editScore: 'Modifier score',
    updateScore: 'Mettre à jour score',
    unassigned: 'Non assignés',
    saveTeams: 'Enregistrer équipes/heures',
    saveTTimes: 'Enregistrer heures',
    noTeamPlayers: 'Aucun joueur ici.',
    sendMessage: 'Envoyer un message',
    hideMessage: 'Masquer le message',
    messageLabel: 'Message',
    messagePlaceholder: 'Rappel : vous jouez aujourd’hui à 15 h 30. Soyez là à temps.',
    sendEventMessage: 'Envoyer le message',
    player: 'Joueur',
    savePlayer: 'Enregistrer',
    noPlayers: 'Aucun junior actif disponible.',
    path: 'Parcours',
    pathLabels: {
      CUP: 'Membre',
      COMMUNITY: 'Événement communautaire',
      EVERYONE: 'Les deux (membre et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'Membre seulement',
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
    textPreviewTitle: 'Text preview',
    textPreviewIntro: 'Recipients',
    textPreviewEmpty: 'No one would receive a text for this round.',
    textPreviewPlayer: 'Junior',
    textPreviewParent: 'Parent',
    textPreviewMessage: 'Message',
    textPreviewMissing: 'The game was posted, but the text preview did not come back from the API. The updated find-games.php file likely needs to be uploaded.',
    textPreviewClose: 'Close',
    edit: 'Edit',
    remove: 'Remove',
    removeConfirm: 'Remove this round?',
    age: 'Age',
    ages: 'Ages',
    ageAny: 'Any age',
    path: 'Path',
    pathLabels: {
      CUP: 'Member',
      COMMUNITY: 'Community',
      EVERYONE: 'Both (Member and Community)',
    },
    pathOnlyLabels: {
      CUP: 'Member only',
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
    textPreviewTitle: 'Aperçu texto',
    textPreviewIntro: 'Destinataires',
    textPreviewEmpty: 'Personne ne recevrait un texto pour cette ronde.',
    textPreviewPlayer: 'Junior',
    textPreviewParent: 'Parent',
    textPreviewMessage: 'Message',
    textPreviewMissing: 'La ronde a été publiée, mais l’aperçu texto n’est pas revenu de l’API. Le fichier find-games.php mis à jour doit probablement être téléversé.',
    textPreviewClose: 'Fermer',
    edit: 'Modifier',
    remove: 'Supprimer',
    removeConfirm: 'Supprimer cette ronde?',
    age: 'Âge',
    ages: 'Âges',
    ageAny: 'Tous âges',
    path: 'Parcours',
    pathLabels: {
      CUP: 'Membre',
      COMMUNITY: 'Communauté',
      EVERYONE: 'Les deux (membre et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'Membre seulement',
      COMMUNITY: 'Communauté seulement',
    },
  },
}
const TRACK_SCORE_COPY = {
  en: {
    track: 'Track score',
    hide: 'Hide scorecard',
    title: 'Track score',
    eventTitle: 'Track event score',
    method: 'Scoring method',
    holes: 'Holes',
    regular: 'Regular',
    stableford: 'Stableford',
    practice: 'Practice',
    regularHole: 'Score',
    stablefordHole: 'Points',
    practiceHole: 'Practice shots',
    hole: 'Hole',
    total: 'Total',
    toPar: 'To par',
    save: 'Save to Scores',
    finish: 'Finish tracking',
    saved: 'Score saved.',
    saving: 'Saving score...',
    saveError: 'Unable to save this score right now.',
  },
  fr: {
    track: 'Suivre le score',
    hide: 'Masquer la carte',
    title: 'Suivre le score',
    eventTitle: 'Suivre le score de l’événement',
    method: 'Méthode de score',
    holes: 'Trous',
    regular: 'Régulier',
    stableford: 'Stableford',
    practice: 'Pratique',
    regularHole: 'Score',
    stablefordHole: 'Points',
    practiceHole: 'Coups de pratique',
    hole: 'Trou',
    total: 'Total',
    toPar: 'Par rapport au par',
    save: 'Enregistrer aux scores',
    finish: 'Terminer',
    saved: 'Score enregistré.',
    saving: 'Enregistrement...',
    saveError: 'Impossible d’enregistrer ce score pour le moment.',
  },
}
const LIVE_SCORE_COPY = {
  en: {
    loadError: 'Unable to open that scorecard.',
    saveError: 'Unable to save this score right now.',
    saving: 'Saving score...',
    saved: 'Score saved.',
    codeReady: 'Enter your code.',
    scoreFor: 'Scoring for',
    event: 'Event',
    submit: 'Submit score',
  },
  fr: {
    loadError: 'Impossible d’ouvrir cette carte.',
    saveError: 'Impossible d’enregistrer ce score.',
    saving: 'Enregistrement...',
    saved: 'Score enregistré.',
    codeReady: 'Entrez votre code.',
    scoreFor: 'Score pour',
    event: 'Événement',
    submit: 'Envoyer score',
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
    sendText: 'Send Text',
    hideText: 'Hide Text',
    messageLabel: 'Message',
    messagePlaceholder: 'Remember you are playing today at 3:30. Please be there on time.',
    sendLessonMessage: 'Send text',
    location: 'Location',
    max: 'Maximum',
    age: 'Age',
    ages: 'Ages',
    ageAny: 'Any age',
    path: 'Path',
    pathLabels: {
      CUP: 'Member',
      COMMUNITY: 'Community',
      EVERYONE: 'Both (Member and Community)',
    },
    pathOnlyLabels: {
      CUP: 'Member only',
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
    sendText: 'Envoyer texto',
    hideText: 'Masquer le texto',
    messageLabel: 'Message',
    messagePlaceholder: 'Rappel : vous jouez aujourd’hui à 15 h 30. Soyez là à temps.',
    sendLessonMessage: 'Envoyer le texto',
    location: 'Lieu',
    max: 'Maximum',
    age: 'Âge',
    ages: 'Âges',
    ageAny: 'Tous âges',
    path: 'Parcours',
    pathLabels: {
      CUP: 'Membre',
      COMMUNITY: 'Communauté',
      EVERYONE: 'Les deux (membre et communauté)',
    },
    pathOnlyLabels: {
      CUP: 'Membre seulement',
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
    firstName: 'First Name',
    lastName: 'Last Name',
    parentName: 'Parent Name',
    parentEmail: 'Parent Email',
    parentText: 'Parent Text',
    playerText: 'Player Text',
    status: 'Status',
    memberInfo: 'Member',
    active: 'Active',
    activeYes: 'Yes',
    activeNo: 'No',
    path: 'Path',
    age: 'Age',
    ageNotSet: 'Age not set',
    notifications: 'Notifications',
    publicStats: 'Scores, points, and rank visibility',
    displayScores: 'Display Scores',
    hideScores: 'Hide Scores',
    publicStatsNote: 'Competitive team points must always show.',
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
    deleteConfirm: 'Set this member inactive?',
    noStaff: 'No admins or teachers found.',
    noCup: 'No Member players found.',
    noCommunity: 'No Community members found.',
    noInactive: 'No inactive members found.',
    textLoading: 'Sending text...',
    textNoRecipients: 'No text numbers found for this selection.',
    textSentPreview: 'Text send complete.',
    textError: 'Unable to send the text right now.',
    textRecipientCount: 'recipients',
    memberTextTitle: 'Send Text',
    memberTextMessage: 'Message',
    memberTextPlaceholder: 'Example: Hi {name}, please remember your tee time today.',
    memberTextSend: 'Send Text',
  },
  fr: {
    loadError: 'Impossible de charger les membres pour le moment.',
    saveError: 'Impossible de mettre ce membre à jour.',
    saving: 'Enregistrement...',
    empty: 'Aucun membre trouvé.',
    player: 'Joueur',
    firstName: 'Prénom',
    lastName: 'Nom',
    parentName: 'Nom parent',
    parentEmail: 'Courriel parent',
    parentText: 'Texto parent',
    playerText: 'Texto joueur',
    status: 'Statut',
    memberInfo: 'Membre',
    active: 'Actif',
    activeYes: 'Oui',
    activeNo: 'Non',
    path: 'Parcours',
    age: 'Âge',
    ageNotSet: 'Âge non indiqué',
    notifications: 'Avis',
    publicStats: 'Visibilité des scores, points et classement',
    displayScores: 'Afficher les scores',
    hideScores: 'Masquer les scores',
    publicStatsNote: 'Les points d’équipe compétitive doivent toujours être affichés.',
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
    deleteConfirm: 'Rendre ce membre inactif?',
    noStaff: 'Aucun admin ou enseignant trouvé.',
    noCup: 'Aucun joueur membre trouvé.',
    noCommunity: 'Aucun membre communauté trouvé.',
    noInactive: 'Aucun membre inactif trouvé.',
    textLoading: 'Envoi du texto...',
    textNoRecipients: 'Aucun numéro texto trouvé pour cette sélection.',
    textSentPreview: 'Envoi texto terminé.',
    textError: 'Impossible d’envoyer le texto pour le moment.',
    textRecipientCount: 'destinataires',
    memberTextTitle: 'Envoyer texto',
    memberTextMessage: 'Message',
    memberTextPlaceholder: 'Exemple : Bonjour {name}, n’oubliez pas votre heure de départ aujourd’hui.',
    memberTextSend: 'Envoyer texto',
  },
}
const TEXT_REPLY_TO_LABEL = 'Reply to - 613-880-3625'
const ADMIN_MEMBER_MANUAL_TEXTS_ENABLED = true
let activeAdminMemberTextPanel = null
let pendingProfileToken = sessionStorage.getItem('pendingProfileToken') || ''
let memberToken = localStorage.getItem(MEMBER_TOKEN_KEY) || ''
let isLoggedIn = isStoredTokenCurrent(memberToken)
let currentMember = getTokenPayload(memberToken)
let currentEventsById = new Map()
let currentFindGamesById = new Map()
let openTrackScoreKey = ''
let isEventAdminModeOpen = false
let currentAdminMembers = []
let currentAdminCashouts = []
let currentAdminFilter = 'staff'
let expandedAdminMemberId = null
let currentAdminPointsPath = 'CUP'
let currentAdminRoundsPath = 'CUP'
let expandedAdminPointsMembers = new Set()
let expandedAdminRoundMembers = new Set()
let showAllAdminRoundMembers = new Set()
let currentRankingResult = null
let expandedRankingRoundMembers = new Set()
let hasCheckedSession = false

if (isRunningStandalone()) {
  document.documentElement.classList.add('is-standalone-app')
}

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
    return 'Member'
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
    return 'Member'
  }

  if (type === 'COMMUNITY') {
    return 'Community'
  }

  if (type === 'ADMIN') {
    return 'Admin'
  }

  if (type === 'SUPER_ADMIN') {
    return 'Super Admin'
  }

  if (type === 'TEACHER') {
    return 'Teacher'
  }

  if (type === 'COACH') {
    return 'Coach'
  }

  return type
}

function currentMemberCanSeeAdminPanel() {
  return ['SUPER_ADMIN', 'ADMIN'].includes(String(currentMember?.membershipType || '').toUpperCase())
}

function setLanguage(language) {
  localStorage.setItem('language', language)
  render()
}

function isMemberPortalPath() {
  return ['/member', '/members'].includes(window.location.pathname.replace(/\/+$/, ''))
}

function isLiveScoringPath() {
  return window.location.pathname.replace(/\/+$/, '') === '/live'
}

function getCurrentRoute() {
  const isMemberPortal = isMemberPortalPath()
  const hashRoute = window.location.hash.replace('#', '')
  const routeId = isLiveScoringPath() && !hashRoute
    ? 'live-score'
    : hashRoute || (isMemberPortal ? 'my-account' : 'home')
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
  const isMemberPortalRoute = isMemberPortalPath()
  let page = getCurrentRoute()

  if (page.accountArea && !hasCheckedSession) {
    await checkMemberSession()
  }

  if (page.accountArea && !isLoggedIn) {
    window.location.hash = 'login'
    page = siteContent.pageMap.get('login')
  }

  if (page.id === 'admin-panel' && !currentMemberCanSeeAdminPanel()) {
    window.location.hash = 'my-account'
    page = siteContent.pageMap.get('my-account')
  }

  const isMemberPortal = isMemberPortalRoute || (page.accountArea && isLoggedIn)

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

  if (page.id === 'ranking') {
    initializeRankingTool(language)
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

  if (page.id === 'admin-panel') {
    const adminPanel = document.querySelector('[data-admin-panel]')

    if (adminPanel) {
      loadAdminMembers(adminPanel, language)
    }
  }

  if (page.id === 'live-score') {
    initializeLiveScoring(language)
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
    status.classList.remove('error', 'success', 'account-created')
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
      status.classList.toggle('account-created', response.ok && result.ok && formType === 'join')
    }

    if (response.ok && result.ok && formType === 'join') {
      form.classList.add('account-created')

      if (submitButton) {
        submitButton.textContent = submitButton.dataset.createdLabel || 'Account created'
        submitButton.disabled = true
      }

      form.querySelector('[data-register-new-junior]')?.classList.remove('is-hidden')
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
    if (submitButton && !form.classList.contains('account-created')) {
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
      ? 'Pour installer l’espace membre sur iPhone, appuyez sur ... au bas du navigateur, choisissez Partager, puis Ajouter à l’écran d’accueil.'
      : 'To install the member area on iPhone, press ... at the bottom of the browser, choose Share, then Add to Home Screen.')
    return
  }

  window.alert(language === 'fr'
    ? 'Si l’invite d’installation ne s’affiche pas, ouvrez le menu du navigateur et choisissez Installer l’application ou Ajouter à l’écran d’accueil.'
    : 'If the install prompt does not appear, open your browser menu and choose Install app or Add to Home screen.')
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

  if (tabName === 'join') {
    resetJoinCreatedState(panel.querySelector('[data-account-form="join"]'), true)
  }
}

function resetJoinCreatedState(form, clearFields = false) {
  if (!form) {
    return
  }

  const status = form.querySelector('[data-account-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const newJuniorButton = form.querySelector('[data-register-new-junior]')

  form.classList.remove('account-created')

  if (status) {
    status.textContent = ''
    status.classList.remove('error', 'success', 'account-created')
  }

  if (submitButton) {
    submitButton.disabled = false
    submitButton.textContent = submitButton.dataset.defaultLabel || 'Join and create account'
  }

  newJuniorButton?.classList.add('is-hidden')

  if (clearFields) {
    form.reset()
  }
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

  const showPublicStats = member?.showPublicStats !== false
  const publicStatsValue = form.querySelector('[data-account-public-stats-value]')

  form.querySelectorAll('[data-account-public-stats]').forEach((input) => {
    input.checked = input.value === (showPublicStats ? '1' : '0')
  })

  if (publicStatsValue) {
    publicStatsValue.value = showPublicStats ? '1' : '0'
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
      return ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'COACH'].includes(type)
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

    if (['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'COACH'].includes(type)) {
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

function getAdminMemberManualTextRecipients(panel) {
  const detail = panel?.closest('.admin-point-detail') || activeAdminMemberTextPanel?.closest('.admin-point-detail')
  const memberForm = detail?.querySelector('[data-admin-member-form]')
  const recipients = []
  const seenNumbers = new Set()

  if (!memberForm) {
    return recipients
  }

  const firstName = memberForm.querySelector('input[name="first_name"]')?.value || ''
  const lastName = memberForm.querySelector('input[name="last_name"]')?.value || ''
  const playerName = `${firstName} ${lastName}`.trim() || 'Junior'
  const parentName = memberForm.querySelector('input[name="parent_name"]')?.value || `Parent of ${playerName}`
  const parentText = memberForm.querySelector('input[name="parent_text"]')?.value || ''
  const playerText = memberForm.querySelector('input[name="player_text"]')?.value || ''

  addTextRecipient(recipients, seenNumbers, parentText, parentName, 'parent')
  addTextRecipient(recipients, seenNumbers, playerText, playerName, 'junior')

  return recipients
}

function setAdminMemberTextModalOpen(panel, isOpen) {
  const modal = panel?.querySelector('[data-admin-member-text-modal]')

  if (!modal) {
    return
  }

  activeAdminMemberTextPanel = isOpen ? panel : null
  modal.classList.toggle('is-hidden', !isOpen)
  modal.setAttribute('aria-hidden', String(!isOpen))

  if (isOpen) {
    modal.querySelector('textarea[name="message"]')?.focus()
  } else {
    modal.querySelector('textarea[name="message"]') && (modal.querySelector('textarea[name="message"]').value = '')
    const results = modal.querySelector('[data-admin-member-text-results]')

    if (results) {
      results.innerHTML = ''
      results.classList.remove('error', 'success')
    }
  }
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

function renderAdminTextPreview(resultsEl, recipients, message, language) {
  const copy = ADMIN_COPY[language]
  const previewMessage = message.includes(TEXT_REPLY_TO_LABEL)
    ? message
    : `${message}\n\n${TEXT_REPLY_TO_LABEL}`

  resultsEl.classList.add('success')
  resultsEl.classList.remove('error')
  resultsEl.innerHTML = `
    <small>${recipients.length} ${escapeHtml(copy.textRecipientCount)}</small>
    <p><strong>Message:</strong> ${escapeHtml(previewMessage)}</p>
    <ul>
      ${recipients.map((recipient) => `
        <li>
          <span>${escapeHtml(recipient.name || '')}${recipient.name ? ' - ' : ''}${escapeHtml(recipient.to || '')}</span>
          <small>${escapeHtml(recipient.type || '')}</small>
        </li>
      `).join('')}
    </ul>
  `
}

async function handleAdminMemberManualText(panel) {
  const modal = panel.querySelector('[data-admin-member-text-modal]')
  const language = getLanguage()
  const copy = ADMIN_COPY[language]
  const resultsEl = modal?.querySelector('[data-admin-member-text-results]')
  const submitButton = modal?.querySelector('[data-admin-member-text-send]')
  const message = String(modal?.querySelector('textarea[name="message"]')?.value || '').trim()
  const recipients = getAdminMemberManualTextRecipients(panel)

  if (!resultsEl) {
    return
  }

  if (!message) {
    resultsEl.textContent = 'Message is required.'
    resultsEl.classList.add('error')
    resultsEl.classList.remove('success')
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

  if (!ADMIN_MEMBER_MANUAL_TEXTS_ENABLED) {
    renderAdminTextPreview(resultsEl, recipients, message, language)

    if (submitButton) {
      submitButton.disabled = false
    }

    return
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

function renderAdminNotificationSummary(member, copy, canEdit = false) {
  const methods = [
    [copy.parentEmailNotify, 'ParentEmail', 'parentEmailNotify', 'parent_email'],
    [copy.playerTextNotify, 'PlayerText', 'playerTextNotify', 'player_text'],
    [copy.parentTextNotify, 'ParentText', 'parentTextNotify', 'parent_text'],
  ]
  const rows = [
    [copy.lessonPosted, 'notifyLessons', 'lessons'],
    [copy.eventPosted, 'notifyEvents', 'events'],
    [copy.roundPosted, 'notifyGames', 'games'],
  ]
  const hasNewNotificationValues = rows.some(([, prefix]) => methods.some(([, suffix]) => Boolean(member?.[`${prefix}${suffix}`])))

  return `
    <div class="admin-notification-summary">
      <h3>${copy.notifications}</h3>
      <div class="admin-notification-groups">
        ${rows.map(([label, prefix, fieldPrefix]) => `
          <section class="admin-notification-group">
            <strong>${label}</strong>
            <div class="admin-notification-methods">
              ${methods.map(([methodLabel, suffix, legacyKey, fieldSuffix]) => {
                const enabled = hasNewNotificationValues
                  ? Boolean(member?.[`${prefix}${suffix}`])
                  : Boolean(member?.[legacyKey])
                const name = `notify_${fieldPrefix}_${fieldSuffix}`
                return `
                  <label class="admin-notification-method ${enabled ? 'is-on' : 'is-off'}">
                    ${canEdit ? `<input type="checkbox" name="${name}" ${enabled ? 'checked' : ''} />` : ''}
                    <span class="admin-notification-dot" aria-hidden="true"></span>
                    ${escapeHtml(methodLabel)}
                  </label>
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
  const canSuperAdmin = String(currentMember?.membershipType || '').toUpperCase() === 'SUPER_ADMIN'

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
            <span class="admin-row-actions">
              <button class="admin-points-toggle ${isExpanded ? 'is-close' : ''}" type="button" data-admin-points-toggle data-member-id="${Number(member.id || 0)}">${isExpanded ? copy.close : copy.manage}</button>
            </span>
          </div>
          ${isExpanded ? `
            <section class="admin-point-detail">
              <form id="admin-member-form-${Number(member.id || 0)}" class="admin-manage-form" data-admin-member-form>
                <input type="hidden" name="action" value="update_member" />
                <input type="hidden" name="member_id" value="${Number(member.id || 0)}" />
                ${canSuperAdmin ? '<input type="hidden" name="email_verified_present" value="1" />' : ''}
                <h3>${copy.manage}</h3>
                <label>
                  <span>${copy.firstName}</span>
                  <input type="text" name="first_name" value="${escapeHtml(member.firstName || '')}" />
                </label>
                <label>
                  <span>${copy.lastName}</span>
                  <input type="text" name="last_name" value="${escapeHtml(member.lastName || '')}" />
                </label>
                <label>
                  <span>${copy.parentName}</span>
                  <input type="text" name="parent_name" value="${escapeHtml(member.parentName || '')}" />
                </label>
                <label>
                  <span>${copy.parentEmail}</span>
                  <input type="email" name="parent_email" value="${escapeHtml(member.parentEmail || '')}" />
                </label>
                <label>
                  <span>${copy.parentText}</span>
                  <input type="tel" name="parent_text" value="${escapeHtml(member.parentText || '')}" />
                </label>
                <label>
                  <span>${copy.playerText}</span>
                  <input type="tel" name="player_text" value="${escapeHtml(member.playerText || '')}" />
                </label>
                <label>
                  <span>${copy.age}</span>
                  <input type="number" name="player_age" min="1" max="18" inputmode="numeric" value="${member.playerAge ? Number(member.playerAge) : ''}" />
                </label>
                <div class="admin-member-text-trigger" data-admin-member-text-panel>
                  <span>${copy.memberTextTitle}</span>
                  <button type="button" data-admin-member-text-open>${copy.memberTextSend}</button>
                  <div class="admin-member-text-modal is-hidden" data-admin-member-text-modal aria-hidden="true">
                    <div class="admin-text-dialog" role="dialog" aria-modal="true">
                      <div class="admin-text-heading">
                        <span>
                          <h3>${copy.memberTextTitle}</h3>
                        </span>
                        <button type="button" data-admin-member-text-close aria-label="${copy.close}">&times;</button>
                      </div>
                      <label>
                        <span>${copy.memberTextMessage}</span>
                        <textarea name="message" rows="5" placeholder="${copy.memberTextPlaceholder}" required></textarea>
                      </label>
                      <div class="admin-text-actions">
                        <button type="button" data-admin-member-text-close>${copy.close}</button>
                        <button type="button" data-admin-member-text-send>${copy.memberTextSend}</button>
                      </div>
                      <div class="admin-text-results" data-admin-member-text-results aria-live="polite"></div>
                    </div>
                  </div>
                </div>
                <fieldset class="account-public-stats-toggle admin-public-stats-toggle">
                  <legend>${copy.publicStats}</legend>
                  <div class="account-public-stats-options">
                    <label>
                      <input type="radio" name="show_public_stats_choice_${Number(member.id || 0)}" value="1" data-account-public-stats data-public-stats-display ${member.showPublicStats !== false ? 'checked' : ''} />
                      <span>${copy.displayScores}</span>
                    </label>
                    <label>
                      <input type="radio" name="show_public_stats_choice_${Number(member.id || 0)}" value="0" data-account-public-stats data-public-stats-hide ${member.showPublicStats === false ? 'checked' : ''} />
                      <span>${copy.hideScores}</span>
                    </label>
                  </div>
                  <input type="hidden" name="show_public_stats" value="${member.showPublicStats !== false ? '1' : '0'}" data-account-public-stats-value />
                  <p>${copy.publicStatsNote}</p>
                </fieldset>
                ${canSuperAdmin ? `<label>
                  <span>${copy.path}</span>
                  <select name="membership_type">
                    ${adminPathOption('CUP', 'Member', membershipType)}
                    ${adminPathOption('COMMUNITY', 'Community', membershipType)}
                    ${adminPathOption('COACH', 'Coach', membershipType)}
                    ${adminPathOption('TEACHER', 'Teacher', membershipType)}
                    ${adminPathOption('ADMIN', 'Admin', membershipType)}
                    ${adminPathOption('SUPER_ADMIN', 'Super Admin', membershipType)}
                  </select>
                </label>
                <label class="account-notify-toggle admin-verify-toggle">
                  <input type="checkbox" name="email_verified" ${isVerified ? 'checked' : ''} />
                  <span>${isVerified ? copy.emailVerified : copy.emailNotVerified}</span>
                </label>` : ''}
                ${renderAdminNotificationSummary(member, copy, canSuperAdmin)}
              </form>
              <div class="admin-member-bottom-actions">
                <button type="submit" form="admin-member-form-${Number(member.id || 0)}">${copy.save}</button>
                ${canSuperAdmin ? `<form class="admin-delete-form" data-admin-delete-form>
                  <input type="hidden" name="action" value="${isActive ? 'set_inactive_member' : 'activate_member'}" />
                  <input type="hidden" name="member_id" value="${Number(member.id || 0)}" />
                  <button class="${isActive ? '' : 'admin-reactivate'}" type="submit">${isActive ? copy.deleteMember : copy.activateMember}</button>
                </form>` : ''}
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

async function loadAdminTextMembers(panel, language) {
  const status = panel.querySelector('[data-admin-status]')

  try {
    const response = await fetch(`${API_BASE_URL}/api/textme.php`, {
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

    if (action === 'create_member') {
      form.reset()
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
  } finally {
    if (button && button.isConnected) {
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

  return [round.format === 'score' ? teeLabel : '', formatLabel].filter(Boolean).join(' • ')
}

function getRoundScoreDisplay(round, language) {
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const format = String(round?.format || '')

  if (format === 'practice') {
    return round.score && round.score !== 'Practice'
      ? round.score
      : language === 'fr' ? 'Aucun score' : 'No score'
  }

  if (format === 'stableford') {
    return `${scoreTool.stablefordScoreLabel[language]} ${round.score}`
  }

  return `${SCORE_COPY[language].scorePrefix} ${round.score}`
}

function updateScoreFormForFormat(form, language) {
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const format = form?.querySelector('[data-score-format]')?.value || 'practice'
  const teeSelect = form?.querySelector('[data-score-tee]')
  const teeField = teeSelect?.closest('label')
  const scoreField = form?.querySelector('[data-score-field]')
  const scoreInput = form?.querySelector('[data-score-input]')
  const scoreLabel = form?.querySelector('[data-score-label]')
  const usesScore = format !== 'practice'
  const numericScore = ['score', 'stableford'].includes(format)

  teeField?.classList.toggle('is-hidden', format !== 'score')

  if (teeSelect) {
    teeSelect.disabled = format !== 'score'
    teeSelect.required = format === 'score'
  }

  scoreField?.classList.toggle('is-hidden', !usesScore)

  if (scoreInput) {
    scoreInput.disabled = !usesScore
    scoreInput.required = usesScore
    scoreInput.type = numericScore ? 'number' : 'text'
    scoreInput.inputMode = numericScore ? 'numeric' : 'text'
    scoreInput.min = numericScore ? '0' : ''
    scoreInput.max = numericScore ? '999' : ''
    scoreInput.step = numericScore ? '1' : ''
    scoreInput.placeholder = format === 'match-play' ? 'Example: Won 3 and 2' : ''
  }

  if (scoreLabel) {
    scoreLabel.textContent = format === 'stableford'
      ? scoreTool.stablefordScoreLabel[language]
      : format === 'match-play'
        ? scoreTool.matchScoreLabel[language]
        : scoreTool.regularScoreLabel[language]
  }
}

function setTodayAsDefaultRoundDate(tool) {
  const dateInput = tool.querySelector('[data-round-date], [data-point-date]')

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
          <strong>${escapeHtml(getRoundScoreDisplay(round, language))}</strong>
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

function setAdminReportToolbarPath(tool, path) {
  tool?.querySelectorAll('[data-admin-report-path]').forEach((button) => {
    const isActive = button.dataset.adminReportPath === path

    button.classList.toggle('active', isActive)
    button.setAttribute('aria-selected', String(isActive))
  })
}

function renderAdminRoundsReport(tool, result, language) {
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const list = tool.querySelector('[data-admin-rounds-list]')
  const path = currentAdminRoundsPath
  const members = Array.isArray(result.roundsReport?.[path]) ? result.roundsReport[path] : []

  setAdminReportToolbarPath(tool, path)

  if (!list) {
    return
  }

  if (!members.length) {
    list.innerHTML = `<p>${list.dataset.emptyLabel || scoreTool.adminEmpty[language]}</p>`
    return
  }

  list.innerHTML = `
    <div class="admin-report-heading">
      <h2>${scoreTool.adminTitle[language]}</h2>
      <span>${members.length} ${path === 'CUP' ? scoreTool.cupButton[language] : scoreTool.communityButton[language]}</span>
    </div>
    <ul class="admin-rounds-report-list">
      ${members.map((member) => {
        const memberId = Number(member.id || 0)
        const rounds = Array.isArray(member.rounds) ? member.rounds : []
        const isExpanded = expandedAdminRoundMembers.has(memberId)
        const showAllRounds = showAllAdminRoundMembers.has(memberId)
        const visibleRounds = showAllRounds ? rounds : rounds.slice(0, 5)

        return `
          <li class="admin-rounds-report-item ${isExpanded ? 'is-expanded' : ''}">
            <div class="admin-member-report-row">
              <button class="admin-member-report-name" type="button" data-admin-rounds-toggle data-member-id="${memberId}" aria-expanded="${isExpanded ? 'true' : 'false'}">
                <strong>${escapeHtml(member.name || '')}</strong>
                <span>${Number(member.roundsPlayed || 0)} ${scoreTool.roundsLabel[language]}</span>
              </button>
              <button type="button" data-admin-rounds-toggle data-member-id="${memberId}" aria-expanded="${isExpanded ? 'true' : 'false'}">
                ${isExpanded ? scoreTool.collapseRounds[language] : scoreTool.expandRounds[language]}
              </button>
            </div>
            ${isExpanded ? `
              <div class="admin-member-round-details">
                ${rounds.length ? `
                  <ul>
                    ${visibleRounds.map((round) => `
                      <li>
                        <strong>${formatRoundDate(round.roundDate, language)}</strong>
                        <span>${escapeHtml(getRoundScoreDisplay(round, language))}</span>
                        <small>${formatRoundMeta(round, language)}</small>
                      </li>
                    `).join('')}
                  </ul>
                  ${rounds.length > 5 ? `
                    <button class="round-list-toggle admin-rounds-show-all" type="button" data-admin-rounds-all-toggle data-member-id="${memberId}" aria-expanded="${showAllRounds ? 'true' : 'false'}">
                      <span>${showAllRounds ? scoreTool.showLatest[language] : scoreTool.showAll[language]}</span>
                      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <path d="M5 7.5 10 12.5 15 7.5" />
                      </svg>
                    </button>
                  ` : ''}
                ` : `<p>${scoreTool.empty[language]}</p>`}
              </div>
            ` : ''}
          </li>
        `
      }).join('')}
    </ul>
  `
}

function renderAdminScoreJuniorOptions(tool, result, language, preferredMemberId = '') {
  const scoreTool = siteContent.pageMap.get('scores').scoreTool
  const select = tool.querySelector('[data-admin-score-member]')

  if (!select) {
    return
  }

  const activeJuniors = result.activeJuniors || {}
  const groups = ['CUP', 'COMMUNITY']
  const preferredValue = String(preferredMemberId || select.value || '')
  let optionCount = 0

  select.innerHTML = groups.map((group) => {
    const juniors = Array.isArray(activeJuniors[group]) ? activeJuniors[group] : []

    if (!juniors.length) {
      return ''
    }

    optionCount += juniors.length

    return `
      <optgroup label="${group === 'CUP' ? scoreTool.cupButton[language] : scoreTool.communityButton[language]}">
        ${juniors.map((junior) => {
          const id = String(junior.id || '')
          const username = junior.username ? ` (${junior.username})` : ''
          const label = `${junior.name || 'Junior'}${username}`

          return `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`
        }).join('')}
      </optgroup>
    `
  }).join('')

  if (!optionCount) {
    select.innerHTML = `<option value="">${scoreTool.adminNoJuniors[language]}</option>`
    select.disabled = true
    select.closest('[data-score-form]')?.querySelector('button[type="submit"]')?.setAttribute('disabled', '')
    return
  }

  select.disabled = false
  select.closest('[data-score-form]')?.querySelector('button[type="submit"]')?.removeAttribute('disabled')

  if (preferredValue && Array.from(select.options).some((option) => option.value === preferredValue)) {
    select.value = preferredValue
  }
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

    if (result.adminView) {
      renderAdminScoreJuniorOptions(tool, result, language)
      renderAdminRoundsReport(tool, result, language)
    } else {
      renderScoresState(tool, result.rounds || [], language)
    }

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

  const form = tool.querySelector('[data-score-form]')

  if (form) {
    setTodayAsDefaultRoundDate(tool)
    updateScoreFormForFormat(form, language)
  }

  loadScores(tool, language)
}

async function handleScoreSubmit(form) {
  const tool = form.closest('[data-scores-tool]')
  const language = getLanguage()
  const status = form.querySelector('[data-score-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const submittedMemberId = String(formData.get('member_id') || '')

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
    updateScoreFormForFormat(form, language)

    if (result.adminView) {
      renderAdminScoreJuniorOptions(tool, result, language, submittedMemberId)
      renderAdminRoundsReport(tool, result, language)
    } else {
      renderScoresState(tool, result.rounds || [], language)
    }

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
      submitButton.disabled = Boolean(form.querySelector('[data-admin-score-member]')?.disabled)
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
  if (result.adminView) {
    renderAdminPointsReport(tool, result, language)
    return
  }

  const balance = Number(result.balance) || 0
  const balanceEl = tool.querySelector('[data-points-balance]')
  const cashoutInput = tool.querySelector('[data-cashout-points]')
  const pointsList = tool.querySelector('[data-points-list]')
  const cashoutRequestsList = tool.querySelector('[data-cashout-requests]')
  const pointsTool = siteContent.pageMap.get('points').pointsTool
  const pendingCashouts = (result.cashoutRequests || []).filter((request) => request.status === 'REQUESTED')
  const pendingTotal = pendingCashouts.reduce((total, request) => total + (Number(request.points) || 0), 0)
  const availableBalance = Math.max(0, balance - pendingTotal)
  const isExpanded = pointsList?.classList.contains('is-expanded')

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
              <strong>${escapeHtml(entry.description || typeLabel)}</strong>
              <span>${escapeHtml(typeLabel)} - ${formatRoundDate(entry.date, language)}</span>
            </div>
            <small class="${amountClass}">${formatPointAmount(entry.points, language)}</small>
          </li>
        `
      }).join('')}
    </ul>
    ${entries.length > 5 ? `
      <button class="round-list-toggle points-list-toggle" type="button" data-points-list-toggle aria-expanded="${isExpanded ? 'true' : 'false'}">
        <span>${isExpanded ? pointsTool.showLatest[language] : pointsTool.showAll[language]}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>
    ` : ''}
  `

  pointsList.classList.toggle('is-expanded', Boolean(isExpanded))
}

function renderAdminPointsReport(tool, result, language) {
  const pointsTool = siteContent.pageMap.get('points').pointsTool
  const list = tool.querySelector('[data-admin-points-list]')
  const count = tool.querySelector('[data-admin-points-count]')
  const path = currentAdminPointsPath
  const members = Array.isArray(result.leaderboard?.[path]) ? result.leaderboard[path] : []

  setAdminReportToolbarPath(tool, path)

  if (count) {
    count.textContent = `${members.length} ${path === 'CUP' ? pointsTool.cupButton[language] : pointsTool.communityButton[language]}`
  }

  if (!list) {
    return
  }

  if (!members.length) {
    list.innerHTML = `<p>${list.dataset.emptyLabel || pointsTool.adminEmpty[language]}</p>`
    return
  }

  list.innerHTML = `
    <ul>
      ${members.map((member, index) => {
        const memberId = Number(member.id || 0)
        const entries = Array.isArray(member.entries) ? member.entries : []
        const isExpanded = expandedAdminPointsMembers.has(memberId)

        return `
          <li class="admin-points-report-item ${isExpanded ? 'is-expanded' : ''}">
            <button class="admin-member-rank" type="button" data-admin-points-report-toggle data-member-id="${memberId}" aria-expanded="${isExpanded ? 'true' : 'false'}">
              <small>${index + 1}</small>
              <div>
                <strong>${escapeHtml(member.name || '')}</strong>
                <span>${Number(member.roundsPlayed || 0)} ${siteContent.pageMap.get('scores').scoreTool.roundsLabel[language]}</span>
              </div>
            </button>
            <small class="is-positive">${formatPointAmount(Number(member.points || 0), language)}</small>
            ${isExpanded ? `
              <div class="admin-member-point-details">
                ${entries.length ? `
                  <ul>
                    ${entries.map((entry) => {
                      const typeLabel = POINTS_COPY[language].types[entry.type] || entry.type
                      const amountClass = Number(entry.points || 0) < 0 ? 'is-negative' : 'is-positive'

                      return `
                        <li>
                          <div>
                            <strong>${escapeHtml(entry.description || typeLabel)}</strong>
                            <span>${escapeHtml(typeLabel)} - ${formatRoundDate(entry.date, language)}</span>
                          </div>
                          <small class="${amountClass}">${formatPointAmount(Number(entry.points || 0), language)}</small>
                        </li>
                      `
                    }).join('')}
                  </ul>
                ` : `<p>${pointsTool.empty[language]}</p>`}
              </div>
            ` : ''}
          </li>
        `
      }).join('')}
    </ul>
  `
}

function renderAdminPointsJuniorOptions(tool, result, language, preferredMemberId = '') {
  const pointsTool = siteContent.pageMap.get('points').pointsTool
  const select = tool.querySelector('[data-admin-points-member]')

  if (!select) {
    return
  }

  const activeJuniors = result.activeJuniors || {}
  const groups = ['CUP', 'COMMUNITY']
  const preferredValue = String(preferredMemberId || select.value || '')
  let optionCount = 0

  select.innerHTML = groups.map((group) => {
    const juniors = Array.isArray(activeJuniors[group]) ? activeJuniors[group] : []

    if (!juniors.length) {
      return ''
    }

    optionCount += juniors.length

    return `
      <optgroup label="${group === 'CUP' ? pointsTool.cupButton[language] : pointsTool.communityButton[language]}">
        ${juniors.map((junior) => {
          const id = String(junior.id || '')
          const username = junior.username ? ` (${junior.username})` : ''
          const label = `${junior.name || 'Junior'}${username}`

          return `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`
        }).join('')}
      </optgroup>
    `
  }).join('')

  const submitButton = select.closest('[data-admin-points-entry-form]')?.querySelector('button[type="submit"]')

  if (!optionCount) {
    select.innerHTML = `<option value="">${pointsTool.adminNoJuniors[language]}</option>`
    select.disabled = true
    submitButton?.setAttribute('disabled', '')
    return
  }

  select.disabled = false
  submitButton?.removeAttribute('disabled')

  if (preferredValue && Array.from(select.options).some((option) => option.value === preferredValue)) {
    select.value = preferredValue
  }
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

    if (result.adminView) {
      renderAdminPointsJuniorOptions(tool, result, language)
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

  const form = tool.querySelector('[data-admin-points-entry-form]')

  if (form) {
    setTodayAsDefaultRoundDate(tool)
  }

  loadPoints(tool, language)
}

function getRankingCopy(language) {
  return siteContent.pageMap.get('ranking').rankingTool
}

function getRankingRowsForPanel(result, panelId) {
  if (panelId === 'rounds') {
    return Array.isArray(result.rounds) ? result.rounds : []
  }

  if (panelId === 'scores') {
    return Array.isArray(result.scores) ? result.scores : []
  }

  return Array.isArray(result.points) ? result.points : []
}

function renderRankingMetric(member, panelId, rankingTool, language) {
  const points = formatPointAmount(Number(member.points || 0), language)
  const rounds = `${Number(member.roundsPlayed || 0)} ${rankingTool.roundsLabel[language]}`
  const lowestScore = member.lowestScore === null || member.lowestScore === undefined
    ? rankingTool.noScore[language]
    : `${rankingTool.lowestScoreLabel[language]} ${Number(member.lowestScore)}`

  if (panelId === 'rounds') {
    return `
      <strong>${rounds}</strong>
      <span>${lowestScore}</span>
    `
  }

  if (panelId === 'scores') {
    return `
      <strong>${lowestScore}</strong>
      <span>${rounds}</span>
    `
  }

  return `
    <strong>${points}</strong>
    <span>${rounds}</span>
  `
}

function renderRankingRecentRounds(member, rankingTool, language) {
  const rounds = Array.isArray(member.recentRegularRounds) ? member.recentRegularRounds : []

  return `
    <div class="ranking-round-detail">
      <h3>${rankingTool.recentRegularRounds[language]}</h3>
      ${rounds.length ? `
        <ul>
          ${rounds.map((round) => `
            <li>
              <strong>${formatRoundDate(round.roundDate, language)}</strong>
              <span>${Number(round.score || 0)}</span>
              <small>${escapeHtml(round.tee || '')}</small>
            </li>
          `).join('')}
        </ul>
      ` : `<p>${rankingTool.noRegularRounds[language]}</p>`}
    </div>
  `
}

function renderRankingPanel(list, rows, panelId, language) {
  const rankingTool = getRankingCopy(language)

  if (panelId === 'travel-team') {
    list.innerHTML = `<p>${rankingTool.travelTeamPending[language]}</p>`
    return
  }

  if (!rows.length) {
    list.innerHTML = `<p>${rankingTool.empty[language]}</p>`
    return
  }

  list.innerHTML = `
    <ol class="ranking-list-items">
      ${rows.map((member, index) => {
        const memberId = Number(member.id || 0)
        const canExpandRounds = panelId === 'rounds'
        const isExpanded = canExpandRounds && expandedRankingRoundMembers.has(memberId)

        return `
        <li class="${isExpanded ? 'is-expanded' : ''}">
          <span class="ranking-place">${index + 1}</span>
          <div class="ranking-player">
            ${canExpandRounds ? `
              <button type="button" data-ranking-round-toggle data-member-id="${memberId}" aria-expanded="${isExpanded ? 'true' : 'false'}">
                <strong>${escapeHtml(member.name || '')}</strong>
                <small>Member</small>
              </button>
            ` : `
              <strong>${escapeHtml(member.name || '')}</strong>
              <small>Member</small>
            `}
          </div>
          <div class="ranking-metric">
            ${renderRankingMetric(member, panelId, rankingTool, language)}
          </div>
          ${isExpanded ? renderRankingRecentRounds(member, rankingTool, language) : ''}
        </li>
        `
      }).join('')}
    </ol>
  `
}

function renderRankingState(tool, result, language) {
  tool.querySelectorAll('[data-ranking-list]').forEach((list) => {
    const panelId = list.dataset.rankingList || 'points'
    renderRankingPanel(list, getRankingRowsForPanel(result, panelId), panelId, language)
  })
}

async function loadRankings(tool, language) {
  const rankingTool = getRankingCopy(language)

  try {
    const response = await fetch(`${API_BASE_URL}/api/ranking.php`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || rankingTool.loadError[language])
    }

    currentRankingResult = result
    renderRankingState(tool, result, language)
  } catch (error) {
    tool.querySelectorAll('[data-ranking-list]').forEach((list) => {
      list.innerHTML = `<p class="error">${escapeHtml(error.message || rankingTool.loadError[language])}</p>`
    })
  }
}

function initializeRankingTool(language) {
  const tool = document.querySelector('[data-ranking-tool]')

  if (!tool) {
    return
  }

  loadRankings(tool, language)
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

async function handleAdminPointsEntrySubmit(form) {
  const tool = form.closest('[data-points-tool]')
  const language = getLanguage()
  const pointsTool = siteContent.pageMap.get('points').pointsTool
  const status = tool.querySelector('[data-points-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const submittedMemberId = String(formData.get('member_id') || '')

  if (status) {
    status.textContent = pointsTool.adminSaving[language]
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
    setTodayAsDefaultRoundDate(tool)
    renderAdminPointsJuniorOptions(tool, result, language, submittedMemberId)
    renderPointsState(tool, result, language)
    closeDatePickers()

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
      submitButton.disabled = Boolean(form.querySelector('[data-admin-points-member]')?.disabled)
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

function renderEventPlayerOptions(activeJuniors, language) {
  const groups = ['CUP', 'COMMUNITY']
  const html = groups.map((group) => {
    const juniors = Array.isArray(activeJuniors?.[group]) ? activeJuniors[group] : []

    if (!juniors.length) {
      return ''
    }

    return `
      <optgroup label="${EVENTS_COPY[language].pathLabels[group] || group}">
        ${juniors.map((junior) => {
          const id = String(junior.id || '')
          const username = junior.username ? ` (${junior.username})` : ''
          const label = `${junior.name || 'Junior'}${username}`

          return `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`
        }).join('')}
      </optgroup>
    `
  }).join('')

  return html || `<option value="">${EVENTS_COPY[language].noPlayers}</option>`
}

function getEventTeamNames(attendees) {
  return [...new Set((Array.isArray(attendees) ? attendees : [])
    .map((attendee) => String(attendee.teamName || '').trim())
    .filter(Boolean))]
}

function getEventTeamTeeTime(teamName, attendees) {
  const match = (Array.isArray(attendees) ? attendees : [])
    .find((attendee) => String(attendee.teamName || '').trim() === teamName && String(attendee.teeTime || '').trim())

  return match ? String(match.teeTime || '').trim() : ''
}

function liveScoreCodeHtml(attendee, event) {
  const code = String(attendee?.liveScoreCode || '').trim()

  if (!event?.teamsPublished || !code) {
    return ''
  }

  return `<a class="event-live-code-link" href="/live?code=${encodeURIComponent(code)}">${escapeHtml(code)}</a>`
}

function renderEventTeamDropZone(teamName, attendees, language) {
  const safeTeamName = escapeHtml(teamName)
  const players = attendees.filter((attendee) => String(attendee.teamName || '').trim() === teamName)
  const teeTime = getEventTeamTeeTime(teamName, attendees)

  return `
    <div class="event-team-column" data-event-team-dropzone data-team-name="${safeTeamName}">
      <div class="event-team-column-heading">
        <strong>${teamName ? safeTeamName : EVENTS_COPY[language].unassigned}</strong>
        ${teamName ? `<button type="button" data-event-team-delete>${EVENTS_COPY[language].deleteTeam}</button>` : ''}
      </div>
      ${teamName ? `
        <label>
          <span>${EVENTS_COPY[language].teeTime}</span>
          <input type="time" value="${escapeHtml(teeTime)}" data-event-team-tee-time />
        </label>
      ` : ''}
      <div class="event-team-players">
        ${players.length ? players.map((attendee) => `
          <div
            class="event-team-player"
            draggable="true"
            data-event-team-player
            data-member-id="${Number(attendee.memberId || 0)}"
          >
            <span class="event-team-player-name">${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}</span>
            ${attendee.liveScoreCode ? `<span class="event-live-code">${EVENTS_COPY[language].liveCode}: <strong>${escapeHtml(attendee.liveScoreCode)}</strong></span>` : ''}
            <label class="event-player-time">
              <span>${EVENTS_COPY[language].teeTime}</span>
              <input type="time" value="${escapeHtml(attendee.teeTime || '')}" data-event-team-player-time />
            </label>
          </div>
        `).join('') : `<span class="event-team-empty">${EVENTS_COPY[language].noTeamPlayers}</span>`}
      </div>
    </div>
  `
}

function renderEventTeamAdmin(event, attendees, language) {
  const teamNames = getEventTeamNames(attendees)
  const unassigned = attendees.filter((attendee) => !String(attendee.teamName || '').trim())
  const eventFormat = String(event.eventFormat || (teamNames.length ? 'TEAM' : 'INDIVIDUAL')).toUpperCase() === 'INDIVIDUAL'
    ? 'INDIVIDUAL'
    : 'TEAM'
  const individualAttendees = attendees.map((attendee) => ({ ...attendee, teamName: '' }))
  const zones = eventFormat === 'INDIVIDUAL'
    ? renderEventTeamDropZone('', individualAttendees, language)
    : [
      unassigned.length ? renderEventTeamDropZone('', attendees, language) : '',
      ...teamNames.map((teamName) => renderEventTeamDropZone(teamName, attendees, language)),
    ].join('')

  return `
    <form class="event-team-admin is-hidden" data-event-team-form>
      <input type="hidden" name="action" value="save_event_teams" />
      <input type="hidden" name="event_id" value="${Number(event.id || 0)}" />
      <input type="hidden" name="event_format" value="${eventFormat}" data-event-format-value />
      <input type="hidden" name="teams_published" value="${event.teamsPublished ? '1' : '0'}" data-event-teams-published />
      <div class="event-format-control">
        <span>${EVENTS_COPY[language].eventFormat}</span>
        <div>
          <button type="button" class="${eventFormat === 'TEAM' ? 'active' : ''}" data-event-format-choice="TEAM">${EVENTS_COPY[language].teamEvent}</button>
          <button type="button" class="${eventFormat === 'INDIVIDUAL' ? 'active' : ''}" data-event-format-choice="INDIVIDUAL">${EVENTS_COPY[language].individualEvent}</button>
        </div>
      </div>
      <div class="event-team-create ${eventFormat === 'INDIVIDUAL' ? 'is-hidden' : ''}">
        <label>
          <span>${EVENTS_COPY[language].teamName}</span>
          <input type="text" maxlength="120" data-event-team-name />
        </label>
        <button type="button" data-event-team-create>${EVENTS_COPY[language].createTeam}</button>
      </div>
      <div class="event-team-board" data-event-team-board>
        ${zones}
      </div>
      <div class="event-team-actions">
        <button type="submit" data-event-team-save-button>${eventFormat === 'INDIVIDUAL' ? EVENTS_COPY[language].saveTTimes : EVENTS_COPY[language].saveTeams}</button>
        <button type="button" data-event-team-publish>${EVENTS_COPY[language].publishTeams}</button>
        ${event.teamsPublished ? `<button type="button" class="is-secondary" data-event-team-unpublish>${EVENTS_COPY[language].unpublishTeams}</button>` : ''}
        ${event.teamsPublished ? `<span>${EVENTS_COPY[language].teamsPublished}</span>` : ''}
      </div>
    </form>
  `
}

function renderEventAttendeesList(attendees, language, event) {
  const teamNames = getEventTeamNames(attendees)

  if (!teamNames.length) {
    return `
      <ul>
        ${attendees.map((attendee) => `<li>${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}${liveScoreCodeHtml(attendee, event)}</li>`).join('')}
      </ul>
    `
  }

  const unassigned = attendees.filter((attendee) => !String(attendee.teamName || '').trim())
  const teams = teamNames.map((teamName) => {
    const players = attendees.filter((attendee) => String(attendee.teamName || '').trim() === teamName)

    return `
      <div class="event-attendee-team">
        <strong>${escapeHtml(teamName)}</strong>
        <ul>${players.map((attendee) => `<li>${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}${liveScoreCodeHtml(attendee, event)}</li>`).join('')}</ul>
      </div>
    `
  }).join('')

  return `
    <div class="event-attendee-teams">
      ${teams}
      ${unassigned.length ? `
        <div class="event-attendee-team">
          <strong>${EVENTS_COPY[language].unassigned}</strong>
          <ul>${unassigned.map((attendee) => `<li>${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}${liveScoreCodeHtml(attendee, event)}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </div>
  `
}

function formatEventTeeTime(value) {
  const text = String(value || '').trim()

  if (!text) {
    return ''
  }

  const [hourText, minuteText] = text.split(':')
  const hour = Number(hourText || 0)
  const minute = Number(minuteText || 0)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

function renderPublishedEventRound(event, attendees, language) {
  if (!event.teamsPublished) {
    return ''
  }

  const teamNames = getEventTeamNames(attendees)
  const isTeamEvent = String(event.eventFormat || 'TEAM').toUpperCase() === 'TEAM'
  const timedPlayers = attendees.filter((attendee) => String(attendee.teeTime || '').trim())
  const unassignedTimedPlayers = timedPlayers.filter((attendee) => !String(attendee.teamName || '').trim())

  if (!teamNames.length && !timedPlayers.length) {
    return ''
  }

  return `
    <div class="event-published-round">
      <strong>${EVENTS_COPY[language].teamsPublished}</strong>
      <div class="event-tee-sheet">
        ${isTeamEvent && teamNames.length ? `${teamNames.map((teamName) => {
          const players = attendees.filter((attendee) => String(attendee.teamName || '').trim() === teamName)
          const teeTime = getEventTeamTeeTime(teamName, attendees)

          return `
            <div class="event-tee-team">
              <span>${formatEventTeeTime(teeTime) || EVENTS_COPY[language].teeTime}</span>
              <strong>${escapeHtml(teamName)}</strong>
              <ul>${players.map((attendee) => `<li>${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}${liveScoreCodeHtml(attendee, event)}</li>`).join('')}</ul>
            </div>
          `
        }).join('')}${unassignedTimedPlayers.map((attendee) => `
          <div class="event-tee-team">
            <span>${formatEventTeeTime(attendee.teeTime)}</span>
            ${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}
            ${liveScoreCodeHtml(attendee, event)}
          </div>
        `).join('')}` : timedPlayers.map((attendee) => `
          <div class="event-tee-team">
            <span>${formatEventTeeTime(attendee.teeTime)}</span>
            ${memberNameHtml(attendee.name || attendee.username || '', attendee.membershipType)}
            ${liveScoreCodeHtml(attendee, event)}
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderEventStandings(event, language) {
  const standings = Array.isArray(event.standings) ? event.standings : []
  const currentMemberType = String(currentMember?.membershipType || '').toUpperCase()
  const canEditScores = currentMemberType === 'SUPER_ADMIN'

  if (!event.teamsPublished) {
    return ''
  }

  return `
    <div class="event-standings">
      <strong>${EVENTS_COPY[language].standings}</strong>
      ${standings.length ? `
        <ol>
          ${standings.map((row) => `
            <li>
              ${memberNameHtml(row.name || '', row.membershipType)}
              <span>${Number(row.score || 0)}</span>
              ${row.teamName ? `<small>${escapeHtml(row.teamName)}${row.teeTime ? ` - ${formatEventTeeTime(row.teeTime)}` : ''}</small>` : ''}
              ${!row.teamName && row.teeTime ? `<small>${formatEventTeeTime(row.teeTime)}</small>` : ''}
              ${Array.isArray(row.holeScores) && row.holeScores.length ? `<small>${EVENTS_COPY[language].holes}: ${row.holeScores.map((score) => Number(score || 0)).join(', ')}</small>` : ''}
              ${canEditScores ? `
                <form class="event-score-edit-form" data-event-score-edit-form>
                  <input type="hidden" name="action" value="update_event_score" />
                  <input type="hidden" name="event_id" value="${Number(event.id || 0)}" />
                  <input type="hidden" name="round_id" value="${Number(row.roundId || 0)}" />
                  <div class="event-score-edit-grid">
                    ${Array.from({ length: Math.max(9, Math.min(18, Number(row.holeScores?.length || 18))) }, (_, index) => `
                      <label>
                        <span>${TRACK_SCORE_COPY[language].hole} ${index + 1}</span>
                        <input type="number" min="0" max="30" step="1" inputmode="numeric" value="${Number(row.holeScores?.[index] || 0)}" data-event-score-hole />
                      </label>
                    `).join('')}
                  </div>
                  <button type="submit">${EVENTS_COPY[language].updateScore}</button>
                </form>
              ` : ''}
            </li>
          `).join('')}
        </ol>
      ` : `<p>${EVENTS_COPY[language].noStandings}</p>`}
    </div>
  `
}

function trackScoreKey(source, id) {
  return `${source}:${Number(id || 0)}`
}

function renderTrackScoreButton(source, id, language, label = '') {
  const key = trackScoreKey(source, id)
  const isOpen = openTrackScoreKey === key
  const openLabel = label || TRACK_SCORE_COPY[language].track

  return `
    <button
      class="event-join-button is-secondary"
      type="button"
      data-track-score-toggle
      data-track-source="${source}"
      data-track-id="${Number(id || 0)}"
      data-track-label="${escapeHtml(openLabel)}"
      aria-expanded="${isOpen ? 'true' : 'false'}"
    >${isOpen ? TRACK_SCORE_COPY[language].hide : openLabel}</button>
  `
}

function getTrackScoreParTotal(holeCount) {
  return holeCount <= 9 ? 36 : 72
}

function renderTrackScoreHoleInputs(holeCount, copy) {
  return Array.from({ length: holeCount }, (_, index) => `
    <label>
      <span>${copy.hole} ${index + 1}</span>
      <input type="number" min="0" max="20" step="1" inputmode="numeric" data-track-hole-score aria-label="${copy.hole} ${index + 1}" />
    </label>
  `).join('')
}

function renderTrackScorePanel({ source, id, holes = 9, date = '', tee = 'red', language }) {
  const copy = TRACK_SCORE_COPY[language]
  const isEvent = source === 'event'
  const isStandaloneScore = source === 'score'
  const holeCount = Math.max(1, Math.min(18, Number(holes || 9)))
  const parTotal = getTrackScoreParTotal(holeCount)

  return `
    <form class="track-score-panel" data-track-score-form data-track-source="${source}">
      <input type="hidden" name="event_id" value="${source === 'event' ? Number(id || 0) : ''}" />
      <input type="hidden" name="round_date" value="${escapeHtml(date || toDateValue(new Date()))}" />
      <input type="hidden" name="tee" value="${escapeHtml(tee)}" />
      <div class="track-score-heading">
        <div>
          <h3>${isEvent ? copy.eventTitle : copy.title}</h3>
        </div>
        ${isStandaloneScore ? `
          <label>
            <span>${copy.holes}</span>
            <select name="holes" data-track-score-holes>
              <option value="9" ${holeCount === 9 ? 'selected' : ''}>9</option>
              <option value="18" ${holeCount === 18 ? 'selected' : ''}>18</option>
            </select>
          </label>
        ` : ''}
        <label>
          <span>${copy.method}</span>
          <select name="format" data-track-score-format ${isEvent ? 'disabled' : ''}>
            <option value="score">${copy.regular}</option>
            <option value="stableford">${copy.stableford}</option>
            <option value="practice">${copy.practice}</option>
          </select>
        </label>
      </div>
      <div class="track-score-grid" data-track-score-grid style="--track-holes: ${holeCount}">
        ${renderTrackScoreHoleInputs(holeCount, copy)}
      </div>
      <div class="track-score-summary">
        <span>${copy.total}: <strong data-track-score-total>0</strong></span>
        <span data-track-score-par data-par-total="${parTotal}">${copy.toPar}: <strong>E</strong></span>
      </div>
      <div class="track-score-actions">
        <button type="submit">${isEvent ? copy.finish : copy.save}</button>
        <p class="score-status" data-track-score-status aria-live="polite"></p>
      </div>
    </form>
  `
}

function renderTrackScorePanelForCard(source, item, language) {
  const id = Number(item?.id || 0)

  if (!id || openTrackScoreKey !== trackScoreKey(source, id)) {
    return ''
  }

  return renderTrackScorePanel({
    source,
    id,
    holes: source === 'round' ? Number(item.gameHoles || 9) : 18,
    date: source === 'round' ? item.gameDate : item.eventDate,
    language,
  })
}

function updateTrackScorePanel(form, language) {
  const copy = TRACK_SCORE_COPY[language]
  const format = form?.querySelector('[data-track-score-format]')?.value || 'score'
  const inputs = Array.from(form?.querySelectorAll('[data-track-hole-score]') || [])
  const total = inputs.reduce((sum, input) => sum + Math.max(0, Number(input.value || 0)), 0)
  const totalOutput = form?.querySelector('[data-track-score-total]')
  const parRow = form?.querySelector('[data-track-score-par]')
  const parOutput = parRow?.querySelector('strong')
  const holeLabel = format === 'stableford'
    ? copy.stablefordHole
    : format === 'practice'
      ? copy.practiceHole
      : copy.regularHole

  inputs.forEach((input, index) => {
    input.max = format === 'practice' ? '30' : '20'
    input.setAttribute('aria-label', `${copy.hole} ${index + 1} ${holeLabel}`)
    input.closest('label')?.querySelector('span')?.replaceChildren(`${copy.hole} ${index + 1} ${holeLabel}`)
  })

  if (totalOutput) {
    totalOutput.textContent = String(total)
  }

  if (parRow) {
    parRow.hidden = format !== 'score'
  }

  if (parOutput) {
    const parTotal = Number(parRow?.dataset.parTotal || 0)
    const diff = total - parTotal
    parOutput.textContent = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff)
  }
}

function updateTrackScoreHoleCount(form, language) {
  const copy = TRACK_SCORE_COPY[language]
  const holes = Math.max(1, Math.min(18, Number(form?.querySelector('[data-track-score-holes]')?.value || 9)))
  const grid = form?.querySelector('[data-track-score-grid]')
  const parRow = form?.querySelector('[data-track-score-par]')

  if (grid) {
    grid.style.setProperty('--track-holes', String(holes))
    grid.innerHTML = renderTrackScoreHoleInputs(holes, copy)
  }

  if (parRow) {
    parRow.dataset.parTotal = String(getTrackScoreParTotal(holes))
  }

  updateTrackScorePanel(form, language)
}

async function handleTrackScoreSubmit(form) {
  const language = getLanguage()
  const status = form.querySelector('[data-track-score-status]')
  const source = form.dataset.trackSource || 'round'
  const formatSelect = form.querySelector('[data-track-score-format]')
  const format = source === 'event' ? 'score' : formatSelect?.value || 'score'
  const total = Array.from(form.querySelectorAll('[data-track-hole-score]'))
    .reduce((sum, input) => sum + Math.max(0, Number(input.value || 0)), 0)
  const submitButton = form.querySelector('button[type="submit"]')

  if (status) {
    status.textContent = TRACK_SCORE_COPY[language].saving
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const formData = new FormData()
    const holeScores = Array.from(form.querySelectorAll('[data-track-hole-score]'))
      .map((input) => Math.max(0, Number(input.value || 0)))
    formData.set('round_date', form.querySelector('input[name="round_date"]')?.value || toDateValue(new Date()))
    formData.set('tee', form.querySelector('input[name="tee"]')?.value || 'red')
    formData.set('format', format)
    formData.set('score', format === 'practice' ? `Practice shots: ${total}` : String(total))
    formData.set('hole_scores', JSON.stringify(holeScores))
    if (source === 'event') {
      formData.set('event_id', form.querySelector('input[name="event_id"]')?.value || '')
    }

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
      throw new Error(result.message || TRACK_SCORE_COPY[language].saveError)
    }

    if (status) {
      status.textContent = TRACK_SCORE_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }

    const scoresTool = form.closest('[data-scores-tool]')

    if (scoresTool) {
      loadScores(scoresTool, language)
    }

    const eventsTool = form.closest('[data-events-tool]')

    if (eventsTool) {
      loadEvents(eventsTool, language)
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || TRACK_SCORE_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function closeVisibleTrackScorePanels() {
  document.querySelectorAll('[data-track-score-form]').forEach((panel) => panel.remove())
  document.querySelectorAll('[data-track-score-toggle]').forEach((button) => {
    button.textContent = button.dataset.trackLabel || TRACK_SCORE_COPY[getLanguage()].track
    button.setAttribute('aria-expanded', 'false')
  })
}

function handleTrackScoreToggle(button) {
  const language = getLanguage()
  const source = button.dataset.trackSource || 'round'
  const id = Number(button.dataset.trackId || 0)
  const key = trackScoreKey(source, id)

  if (!id) {
    return
  }

  if (openTrackScoreKey === key) {
    openTrackScoreKey = ''
    closeVisibleTrackScorePanels()
    return
  }

  openTrackScoreKey = key
  closeVisibleTrackScorePanels()

  const item = source === 'event'
    ? currentEventsById.get(String(id))
    : currentFindGamesById.get(String(id))
  const target = button.closest('li')?.querySelector('.event-attendees') || button.closest('li')

  if (!item || !target) {
    return
  }

  button.textContent = TRACK_SCORE_COPY[language].hide
  button.setAttribute('aria-expanded', 'true')
  target.insertAdjacentHTML('beforeend', renderTrackScorePanelForCard(source, item, language))
  const panel = target.querySelector('[data-track-score-form]')

  if (panel) {
    updateTrackScorePanel(panel, language)
    panel.querySelector('[data-track-hole-score]')?.focus()
  }
}

function renderLiveScorecard(context, language) {
  const copy = LIVE_SCORE_COPY[language]
  const holes = Number(context?.holes || 18)

  return `
    <div class="live-score-summary">
      <strong>${copy.event}: ${escapeHtml(context?.eventName || '')}</strong>
      <span>${copy.scoreFor}: ${escapeHtml(context?.scoringFor || context?.playerName || '')}</span>
    </div>
    <form class="track-score-panel live-score-form" data-live-score-form>
      <input type="hidden" name="code" value="${escapeHtml(context?.code || '')}" />
      <div class="track-score-grid" data-track-score-grid>
        ${renderTrackScoreHoleInputs(holes, TRACK_SCORE_COPY[language])}
      </div>
      <div class="track-score-summary">
        <span>${TRACK_SCORE_COPY[language].total}: <strong data-track-score-total>0</strong></span>
        <span data-track-score-par data-par-total="${getTrackScoreParTotal(holes)}">${TRACK_SCORE_COPY[language].toPar}: <strong>E</strong></span>
      </div>
      <div class="track-score-actions">
        <button type="submit">${copy.submit}</button>
      </div>
    </form>
  `
}

async function loadLiveScorecard(code, language) {
  const page = document.querySelector('[data-live-score-page]')
  const card = page?.querySelector('[data-live-score-card]')
  const status = page?.querySelector('[data-live-score-status]')
  const normalizedCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)

  if (!page || !card || normalizedCode.length !== 4) {
    return
  }

  if (status) {
    status.textContent = LIVE_SCORE_COPY[language].codeReady
    status.classList.remove('error', 'success')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/live-score.php?code=${encodeURIComponent(normalizedCode)}`, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || LIVE_SCORE_COPY[language].loadError)
    }

    card.innerHTML = renderLiveScorecard(result, language)
    updateTrackScorePanel(card.querySelector('[data-live-score-form]'), language)
    card.querySelector('[data-track-hole-score]')?.focus()

    if (status) {
      status.textContent = ''
      status.classList.remove('error', 'success')
    }
  } catch (error) {
    card.innerHTML = ''
    if (status) {
      status.textContent = error.message || LIVE_SCORE_COPY[language].loadError
      status.classList.add('error')
      status.classList.remove('success')
    }
  }
}

function initializeLiveScoring(language) {
  const page = document.querySelector('[data-live-score-page]')
  const status = page?.querySelector('[data-live-score-status]')
  const input = page?.querySelector('[data-live-code-input]')
  const urlCode = new URLSearchParams(window.location.search).get('code') || ''

  if (status) {
    status.textContent = LIVE_SCORE_COPY[language].codeReady
    status.classList.remove('error', 'success')
  }

  if (input) {
    input.value = urlCode.trim().toUpperCase().slice(0, 4)
    input.focus()
  }

  if (urlCode) {
    loadLiveScorecard(urlCode, language)
  }
}

async function handleLiveCodeSubmit(form) {
  const language = getLanguage()
  const code = form.querySelector('[data-live-code-input]')?.value || ''

  await loadLiveScorecard(code, language)
}

async function handleLiveScoreSubmit(form) {
  const page = form.closest('[data-live-score-page]')
  const status = page?.querySelector('[data-live-score-status]')
  const language = getLanguage()
  const submitButton = form.querySelector('button[type="submit"]')
  const holeScores = Array.from(form.querySelectorAll('[data-track-hole-score]'))
    .map((input) => Math.max(0, Number(input.value || 0)))
  const formData = new FormData(form)

  formData.set('hole_scores', JSON.stringify(holeScores))

  if (status) {
    status.textContent = LIVE_SCORE_COPY[language].saving
    status.classList.remove('error', 'success')
  }

  if (submitButton) {
    submitButton.disabled = true
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/live-score.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.message || LIVE_SCORE_COPY[language].saveError)
    }

    if (status) {
      status.textContent = result.message || LIVE_SCORE_COPY[language].saved
      status.classList.add('success')
      status.classList.remove('error')
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || LIVE_SCORE_COPY[language].saveError
      status.classList.add('error')
      status.classList.remove('success')
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false
    }
  }
}

function handleScoreStartRoundToggle(button) {
  const language = getLanguage()
  const panel = button.closest('[data-scores-tool]')?.querySelector('[data-score-start-round-panel]')
  const isOpen = button.getAttribute('aria-expanded') === 'true'

  if (!panel) {
    return
  }

  if (isOpen) {
    panel.innerHTML = ''
    button.textContent = button.dataset.showLabel || siteContent.pageMap.get('scores').scoreTool.startRoundButton[language]
    button.setAttribute('aria-expanded', 'false')
    return
  }

  panel.innerHTML = renderTrackScorePanel({
    source: 'score',
    id: 1,
    holes: 9,
    date: toDateValue(new Date()),
    language,
  })
  button.textContent = button.dataset.hideLabel || TRACK_SCORE_COPY[language].hide
  button.setAttribute('aria-expanded', 'true')

  const form = panel.querySelector('[data-track-score-form]')
  updateTrackScorePanel(form, language)
  form?.querySelector('[data-track-hole-score]')?.focus()
}

function renderEventCollection(container, events, language, title = '', options = {}) {
  if (!container) {
    return
  }

  const showJoin = Boolean(options.showJoin)
  const showWinner = Boolean(options.showWinner)
  const showAdminActions = Boolean(options.showAdminActions)
  const activeJuniors = options.activeJuniors || {}
  const playerOptions = renderEventPlayerOptions(activeJuniors, language)
  const hasPlayerOptions = !playerOptions.includes('<option value="">')

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
        const currentMemberType = String(currentMember?.membershipType || '').toUpperCase()
        const currentMemberId = Number(currentMember?.id || currentMember?.sub || 0)
        const isEventOwner = Number(event.createdByMemberId || 0) === currentMemberId
        const canEditEvent = showAdminActions && (
          event.canEdit === true
          || (event.canEdit === undefined && (
            currentMemberType === 'SUPER_ADMIN'
            || (currentMemberType === 'ADMIN' && isEventOwner)
          ))
        )
        const canDeleteEvent = showAdminActions && (
          event.canDelete === true
          || (event.canDelete === undefined && (
            currentMemberType === 'SUPER_ADMIN'
            || (currentMemberType === 'ADMIN' && isEventOwner)
          ))
        )
        const canAddPlayerToEvent = showAdminActions && (
          event.canAddPlayer === true
          || (event.canAddPlayer === undefined && currentMemberType === 'SUPER_ADMIN')
        )
        const canAdminTeams = showAdminActions && canEditEvent
        const canMessageEvent = showAdminActions && ['SUPER_ADMIN', 'ADMIN'].includes(currentMemberType)
        const canManage = canMessageEvent || canAdminTeams
        const canJoinAge = event.isAgeEligible !== false
        const joinLabel = !canJoinPath
          ? pathOnlyLabel(EVENTS_COPY[language], eventPath)
          : !canJoinAge ? ageLabel
          : isFull ? EVENTS_COPY[language].full : EVENTS_COPY[language].join
        const communityCost = Number(event.communityCost || 0)
        const costLabel = eventPath === 'CUP'
          ? ''
          : `${EVENTS_COPY[language].communityCost}: ${formatCurrency(communityCost, language)}`
        const eventScoreButtonLabel = event.teamsPublished ? EVENTS_COPY[language].openRound : TRACK_SCORE_COPY[language].track

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
              ${canManage ? `
                ${canEditEvent ? `<button
                  class="event-join-button"
                  type="button"
                  data-event-edit
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].edit}</button>` : ''}
                ${canDeleteEvent ? `<button
                  class="event-join-button is-danger"
                  type="button"
                  data-event-action="delete_event"
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].remove}</button>` : ''}
                ${canAddPlayerToEvent ? `<button
                  class="event-join-button is-secondary"
                  type="button"
                  data-event-add-player-toggle
                  data-event-id="${Number(event.id || 0)}"
                  data-show-label="${EVENTS_COPY[language].addPlayer}"
                  data-hide-label="${EVENTS_COPY[language].hideAddPlayer}"
                  aria-expanded="false"
                >${EVENTS_COPY[language].addPlayer}</button>` : ''}
                ${canAdminTeams ? `<button
                  class="event-join-button is-admin"
                  type="button"
                  data-event-team-toggle
                  data-event-id="${Number(event.id || 0)}"
                  data-show-label="${EVENTS_COPY[language].admin}"
                  data-hide-label="${EVENTS_COPY[language].hideAdmin}"
                  aria-expanded="false"
                >${EVENTS_COPY[language].admin}</button>` : ''}
                ${canMessageEvent ? `<button
                  class="event-join-button is-message"
                  type="button"
                  data-event-message-toggle
                  data-event-id="${Number(event.id || 0)}"
                  data-show-label="${EVENTS_COPY[language].sendMessage}"
                  data-hide-label="${EVENTS_COPY[language].hideMessage}"
                  aria-expanded="false"
                >${EVENTS_COPY[language].sendMessage}</button>` : ''}
              ` : showJoin ? event.isJoined ? `
                <button
                  class="event-join-button is-secondary"
                  type="button"
                  data-event-action="leave"
                  data-event-id="${Number(event.id || 0)}"
                >${EVENTS_COPY[language].leave}</button>
                ${renderTrackScoreButton('event', event.id, language, eventScoreButtonLabel)}
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
              ${attendees.length ? renderEventAttendeesList(attendees, language, event) : `<p>${EVENTS_COPY[language].noAttendees}</p>`}
              ${renderPublishedEventRound(event, attendees, language)}
              ${renderEventStandings(event, language)}
              ${canAddPlayerToEvent ? `
                <form class="event-add-player-form is-hidden" data-event-add-player-form>
                  <input type="hidden" name="action" value="add_attendee" />
                  <input type="hidden" name="event_id" value="${Number(event.id || 0)}" />
                  <label>
                    <span>${EVENTS_COPY[language].player}</span>
                    <select name="member_id" required ${hasPlayerOptions ? '' : 'disabled'}>
                      ${playerOptions}
                    </select>
                  </label>
                  <button type="submit" ${hasPlayerOptions ? '' : 'disabled'}>${EVENTS_COPY[language].savePlayer}</button>
                </form>
              ` : ''}
              ${canMessageEvent ? `
                <form class="event-message-form is-hidden" data-event-message-form>
                  <input type="hidden" name="action" value="send_event_message" />
                  <input type="hidden" name="event_id" value="${Number(event.id || 0)}" />
                  <label>
                    <span>${EVENTS_COPY[language].messageLabel}</span>
                    <textarea name="message" rows="3" maxlength="1000" placeholder="${EVENTS_COPY[language].messagePlaceholder}" required></textarea>
                  </label>
                  <button type="submit">${EVENTS_COPY[language].sendEventMessage}</button>
                </form>
              ` : ''}
              ${canAdminTeams ? renderEventTeamAdmin(event, attendees, language) : ''}
              ${renderTrackScorePanelForCard('event', event, language)}
            </div>
          </li>
        `
      }).join('')}
    </ul>
  `
}

function renderEventsState(tool, result, language) {
  const allEvents = [...(result.upcoming || []), ...(result.past || [])]
  const currentMemberType = String(currentMember?.membershipType || '').toUpperCase()
  const canAddEvents = ['SUPER_ADMIN', 'ADMIN'].includes(currentMemberType)
  const showAdminActions = canAddEvents
  const adminPanel = tool.querySelector('[data-event-admin-panel]')
  const adminToggle = tool.querySelector('[data-event-admin-toggle]')

  currentEventsById = new Map(allEvents.map((event) => [String(event.id), event]))
  adminPanel?.classList.toggle('is-hidden', !(canAddEvents && isEventAdminModeOpen))

  if (adminToggle) {
    adminToggle.textContent = isEventAdminModeOpen
      ? adminToggle.dataset.hideLabel
      : adminToggle.dataset.showLabel
    adminToggle.setAttribute('aria-expanded', String(isEventAdminModeOpen))
  }

  renderEventCollection(tool.querySelector('[data-upcoming-events]'), result.upcoming || [], language, '', {
    showAdminActions,
    showJoin: !showAdminActions,
    activeJuniors: result.activeJuniors,
  })
  renderEventCollection(
    tool.querySelector('[data-past-events]'),
    result.past || [],
    language,
    tool.querySelector('[data-past-events]')?.dataset.title || '',
    {
      showAdminActions,
      showWinner: true,
      activeJuniors: result.activeJuniors,
    },
  )
}

function renderFindGamesState(tool, games, language) {
  const list = tool.querySelector('[data-find-game-list]')
  currentFindGamesById = new Map((Array.isArray(games) ? games : []).map((game) => [String(game.id), game]))

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
        const currentMemberType = String(currentMember?.membershipType || '').toUpperCase()
        const spotsRemaining = Number(game.spotsRemaining || 0)
        const isFull = spotsRemaining <= 0
        const canManage = game.canManage === true
          || (game.canManage === undefined && (
            Number(game.createdByMemberId || 0) === currentMemberId
            || currentMemberType === 'SUPER_ADMIN'
          ))
        const gamePath = String(game.gamePath || 'EVERYONE')
        const canJoinPath = pathAllowsCurrentMember(gamePath)
        const ageLabel = ageRangeLabel(game.minAge, game.maxAge, language, FIND_GAME_COPY[language])
        const canJoinAge = game.isAgeEligible !== false
        const buttonLabel = game.isJoined
          ? FIND_GAME_COPY[language].leave
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
              <span>${FIND_GAME_COPY[language].holes}: ${Number(game.gameHoles || 9)}</span>
              <span>${FIND_GAME_COPY[language].path}: ${FIND_GAME_COPY[language].pathLabels[gamePath] || gamePath}</span>
              <span>${FIND_GAME_COPY[language].age}: ${escapeHtml(ageLabel)}</span>
              <p class="event-card-description">${escapeHtml(game.roundDetails)}</p>
            </div>
            <div class="event-card-points">
              <span class="event-spots">${spotsRemaining} ${FIND_GAME_COPY[language].spotsOpen}</span>
              ${canManage ? `
                <button
                  class="event-join-button"
                  type="button"
                  data-find-game-edit
                  data-game-id="${Number(game.id || 0)}"
                >${FIND_GAME_COPY[language].edit}</button>
                <button
                  class="event-join-button is-danger"
                  type="button"
                  data-find-game-action="delete_game"
                  data-game-id="${Number(game.id || 0)}"
                >${FIND_GAME_COPY[language].remove}</button>
                ${renderTrackScoreButton('round', game.id, language)}
              ` : `
                <button
                  class="event-join-button ${game.isJoined ? 'is-secondary' : ''}"
                  type="button"
                  data-find-game-action="${game.isJoined ? 'leave' : 'join'}"
                  data-game-id="${Number(game.id || 0)}"
                  ${(!game.isJoined && (isFull || !canJoinPath || !canJoinAge)) ? 'disabled' : ''}
                >${buttonLabel}</button>
                ${game.isJoined ? renderTrackScoreButton('round', game.id, language) : ''}
              `}
            </div>
            <div class="event-attendees">
              <strong>${FIND_GAME_COPY[language].playing}</strong>
              ${players.length ? `
                <ul>
                  ${players.map((player) => `<li>${memberNameHtml(player.name || player.username || '', player.membershipType)}</li>`).join('')}
                </ul>
              ` : `<p>${FIND_GAME_COPY[language].playing}</p>`}
              ${renderTrackScorePanelForCard('round', game, language)}
            </div>
          </li>
        `
      }).join('')}
    </ul>
  `
}

function renderFindGameTextPreview(tool, preview, language) {
  const previewPanel = tool?.querySelector('[data-find-game-text-preview]')
  const modalContent = tool?.querySelector('[data-find-game-text-modal-content]')

  if (!previewPanel && !modalContent) {
    return
  }

  if (!preview) {
    if (previewPanel) {
      previewPanel.hidden = true
      previewPanel.innerHTML = ''
    }

    if (modalContent) {
      modalContent.innerHTML = ''
    }

    return
  }

  const copy = FIND_GAME_COPY[language]
  const recipients = Array.isArray(preview.recipients) ? preview.recipients : []
  const message = String(preview.message || '')
  const isMissing = Boolean(preview.previewMissing)
  const empty = language === 'fr' ? 'Aucun destinataire.' : 'No recipients.'
  const previewHtml = `
    <div class="find-game-text-preview-heading">
      <strong>${copy.textPreviewTitle}</strong>
      <span>${recipients.length} ${ADMIN_COPY[language].textRecipientCount}</span>
    </div>
    ${isMissing || !recipients.length ? `<p>${isMissing ? copy.textPreviewMissing : empty}</p>` : ''}
    ${message ? `<p><strong>${copy.textPreviewMessage}:</strong> ${escapeHtml(message)}</p>` : ''}
    ${recipients.length ? `
      <ul>
        ${recipients.map((recipient) => {
          const type = recipient.recipientType === 'parent' ? copy.textPreviewParent : copy.textPreviewPlayer

          return `
            <li>
              <strong>${escapeHtml(recipient.name || '')}</strong>
              <span>${escapeHtml(type)}${recipient.phone ? ` ${escapeHtml(recipient.phone)}` : ''}</span>
            </li>
          `
        }).join('')}
      </ul>
    ` : ''}
  `

  if (previewPanel) {
    previewPanel.hidden = false
    previewPanel.innerHTML = previewHtml
  }

  if (modalContent) {
    modalContent.innerHTML = `
      ${previewHtml}
      <div class="find-game-text-dialog-actions">
        <button type="button" data-find-game-text-close>${copy.textPreviewClose}</button>
      </div>
    `
  }
}

function setFindGameTextModalOpen(tool, isOpen) {
  const modal = tool?.querySelector('[data-find-game-text-modal]')

  if (!modal) {
    return
  }

  modal.classList.toggle('is-hidden', !isOpen)
  modal.setAttribute('aria-hidden', String(!isOpen))

  if (isOpen) {
    modal.querySelector('[data-find-game-text-close]')?.focus()
  }
}

function getTextResultsSummary(result, language) {
  const rows = Array.isArray(result?.textResults) ? result.textResults : []

  if (!rows.length) {
    return ''
  }

  const sent = rows.filter((row) => row?.ok).length
  const failed = rows.length - sent

  if (language === 'fr') {
    return ` Textos envoyes : ${sent}${failed ? `, echoues : ${failed}` : ''}.`
  }

  return ` Texts sent: ${sent}${failed ? `, failed: ${failed}` : ''}.`
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
    renderFindGameTextPreview(tool, null, language)

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
  const currentMemberType = String(currentMember?.membershipType || '').toUpperCase()
  const canTeach = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'COACH'].includes(currentMemberType)
  const canJoinLesson = ['CUP', 'COMMUNITY'].includes(currentMemberType)
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
          const canMessageLesson = students.length > 0 && (['SUPER_ADMIN', 'ADMIN'].includes(currentMemberType) || isProvider)
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
                ${canMessageLesson ? `<button
                  class="event-join-button is-message"
                  type="button"
                  data-lesson-message-toggle
                  data-slot-id="${Number(slot.id || 0)}"
                  data-show-label="${LESSON_COPY[language].sendText}"
                  data-hide-label="${LESSON_COPY[language].hideText}"
                  aria-expanded="false"
                >${LESSON_COPY[language].sendText}</button>` : ''}
              </div>
              <div class="event-attendees">
                <strong>${LESSON_COPY[language].students}</strong>
                ${students.length ? `<ul>${students.map((student) => `<li>${memberNameHtml(student.name || student.username || '', student.membershipType)}</li>`).join('')}</ul>` : `<p>${bookedContainer.dataset.emptyLabel || ''}</p>`}
                ${canMessageLesson ? `
                  <form class="event-message-form is-hidden" data-lesson-message-form>
                    <input type="hidden" name="action" value="send_lesson_message" />
                    <input type="hidden" name="slot_id" value="${Number(slot.id || 0)}" />
                    <label>
                      <span>${LESSON_COPY[language].messageLabel}</span>
                      <textarea name="message" rows="3" maxlength="1000" placeholder="${LESSON_COPY[language].messagePlaceholder}" required></textarea>
                    </label>
                    <button type="submit">${LESSON_COPY[language].sendLessonMessage}</button>
                  </form>
                ` : ''}
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
  const notifyInput = form.querySelector('input[name="notify_others"]')
  const notifyField = form.querySelector('[data-event-notify-field]')

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

  if (notifyInput) {
    notifyInput.checked = true
    notifyInput.disabled = false
  }

  notifyField?.classList.remove('is-hidden')

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
  const adminToggle = tool?.querySelector('[data-event-admin-toggle]')
  const notifyInput = form.querySelector('input[name="notify_others"]')
  const notifyField = form.querySelector('[data-event-notify-field]')

  isEventAdminModeOpen = true
  form.classList.remove('is-hidden')

  if (adminToggle) {
    adminToggle.textContent = adminToggle.dataset.hideLabel || adminToggle.textContent
    adminToggle.setAttribute('aria-expanded', 'true')
  }

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

  if (notifyInput) {
    notifyInput.checked = false
    notifyInput.disabled = true
  }

  notifyField?.classList.add('is-hidden')

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
  const action = String(formData.get('action') || 'add_event')

  if (action === 'update_event') {
    formData.delete('notify_others')
  }

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

    if (action === 'update_event') {
      isEventAdminModeOpen = false
    }

    renderEventsState(tool, result, language)
    renderFindGameTextPreview(tool, null, language)
    setFindGameTextModalOpen(tool, false)

    if (status) {
      status.textContent = `${result.message || EVENTS_COPY[language].saved}${getTextResultsSummary(result, language)}`
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

async function handleEventAddPlayerSubmit(form) {
  const tool = form.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-events-status]')
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

function refreshEventTeamDropZone(zone, language) {
  if (!zone) {
    return
  }

  const players = zone.querySelectorAll('[data-event-team-player]')
  let empty = zone.querySelector('.event-team-empty')

  if (players.length && empty) {
    empty.remove()
    return
  }

  if (!players.length && !empty) {
    empty = document.createElement('span')
    empty.className = 'event-team-empty'
    empty.textContent = EVENTS_COPY[language].noTeamPlayers
    zone.querySelector('.event-team-players')?.append(empty)
  }
}

function moveEventTeamPlayer(player, targetZone, language) {
  const sourceZone = player?.closest('[data-event-team-dropzone]')
  const targetPlayers = targetZone?.querySelector('.event-team-players')

  if (!player || !targetZone || !targetPlayers) {
    return
  }

  targetZone.querySelector('.event-team-empty')?.remove()
  targetPlayers.append(player)
  refreshEventTeamDropZone(sourceZone, language)
  refreshEventTeamDropZone(targetZone, language)
}

function ensureEventUnassignedDropZone(form, language) {
  let zone = form?.querySelector('[data-event-team-dropzone][data-team-name=""]')
  const board = form?.querySelector('[data-event-team-board]')

  if (zone || !board) {
    return zone
  }

  const wrapper = document.createElement('div')
  wrapper.innerHTML = renderEventTeamDropZone('', [], language).trim()
  zone = wrapper.firstElementChild
  board.prepend(zone)

  return zone
}

function deleteEventTeam(button) {
  const language = getLanguage()
  const zone = button.closest('[data-event-team-dropzone]')
  const form = button.closest('[data-event-team-form]')
  const unassignedZone = ensureEventUnassignedDropZone(form, language)

  if (!zone || !unassignedZone || zone === unassignedZone) {
    return
  }

  zone.querySelectorAll('[data-event-team-player]').forEach((player) => {
    moveEventTeamPlayer(player, unassignedZone, language)
  })

  zone.remove()
  refreshEventTeamDropZone(unassignedZone, language)
}

function setEventAdminFormat(button) {
  const form = button.closest('[data-event-team-form]')
  const nextFormat = button.dataset.eventFormatChoice === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'TEAM'
  const formatInput = form?.querySelector('[data-event-format-value]')
  const createRow = form?.querySelector('.event-team-create')
  const board = form?.querySelector('[data-event-team-board]')
  const saveButton = form?.querySelector('[data-event-team-save-button]')
  const language = getLanguage()

  if (!form || !formatInput || !board) {
    return
  }

  formatInput.value = nextFormat
  form.querySelectorAll('[data-event-format-choice]').forEach((choice) => {
    choice.classList.toggle('active', choice.dataset.eventFormatChoice === nextFormat)
  })
  createRow?.classList.toggle('is-hidden', nextFormat === 'INDIVIDUAL')
  if (saveButton) {
    saveButton.textContent = nextFormat === 'INDIVIDUAL'
      ? EVENTS_COPY[language].saveTTimes
      : EVENTS_COPY[language].saveTeams
  }

  if (nextFormat === 'INDIVIDUAL') {
    const players = [...form.querySelectorAll('[data-event-team-player]')]
    board.innerHTML = renderEventTeamDropZone('', [], language).trim()
    const unassignedZone = board.querySelector('[data-event-team-dropzone]')

    players.forEach((player) => {
      moveEventTeamPlayer(player, unassignedZone, language)
    })
    refreshEventTeamDropZone(unassignedZone, language)
  } else if (!board.querySelector('[data-event-team-dropzone]')) {
    board.innerHTML = renderEventTeamDropZone('', [], language).trim()
  }
}

function createEventTeam(button) {
  const form = button.closest('[data-event-team-form]')
  const input = form?.querySelector('[data-event-team-name]')
  const board = form?.querySelector('[data-event-team-board]')
  const language = getLanguage()
  const teamName = String(input?.value || '').trim()

  if (!form || !input || !board || !teamName) {
    input?.focus()
    return
  }

  const exists = [...board.querySelectorAll('[data-event-team-dropzone]')]
    .some((zone) => String(zone.dataset.teamName || '').trim().toLowerCase() === teamName.toLowerCase())

  if (exists) {
    input.value = ''
    return
  }

  const wrapper = document.createElement('div')
  wrapper.innerHTML = renderEventTeamDropZone(teamName, [], language).trim()
  board.append(wrapper.firstElementChild)
  input.value = ''
  input.focus()
}

async function handleEventTeamSubmit(form) {
  const tool = form.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-events-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const assignments = [...form.querySelectorAll('[data-event-team-player]')].map((player) => {
    const zone = player.closest('[data-event-team-dropzone]')
    const eventFormat = form.querySelector('[data-event-format-value]')?.value || 'TEAM'
    const teamName = eventFormat === 'INDIVIDUAL' ? '' : String(zone?.dataset.teamName || '')

    return {
      memberId: Number(player.dataset.memberId || 0),
      teamName,
      teeTime: teamName
        ? String(zone?.querySelector('[data-event-team-tee-time]')?.value || '')
        : String(player.querySelector('[data-event-team-player-time]')?.value || ''),
      scoringForMemberId: 0,
      scoringForTeamName: '',
      scoringForGroup: false,
    }
  })
  const hasTeams = assignments.some((assignment) => String(assignment.teamName || '').trim())
  const hasStartingTimes = assignments.some((assignment) => String(assignment.teeTime || '').trim())
  const publishedInput = form.querySelector('[data-event-teams-published]')

  if (!hasTeams && !hasStartingTimes && publishedInput) {
    publishedInput.value = '0'
  }

  formData.append('assignments', JSON.stringify(assignments))

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

async function handleEventMessageSubmit(form) {
  const tool = form.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-events-status]')
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

    renderEventsState(tool, result, language)
    renderFindGameTextPreview(tool, result.textResults?.dryRun ? result.textResults : null, language)
    setFindGameTextModalOpen(tool, Boolean(result.textResults?.dryRun))

    if (status) {
      status.textContent = `${result.message || EVENTS_COPY[language].saved}${getTextResultsSummary(result, language)}`
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

async function handleEventScoreEditSubmit(form) {
  const tool = form.closest('[data-events-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-events-status]')
  const submitButton = form.querySelector('button[type="submit"]')
  const formData = new FormData(form)
  const holeScores = Array.from(form.querySelectorAll('[data-event-score-hole]'))
    .map((input) => Math.max(0, Number(input.value || 0)))

  formData.set('hole_scores', JSON.stringify(holeScores))

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

function resetFindGameForm(form) {
  if (!form) {
    return
  }

  const actionInput = form.querySelector('input[name="action"]')
  const gameIdInput = form.querySelector('input[name="game_id"]')
  const dateInput = form.querySelector('input[name="game_date"]')
  const title = form.querySelector('[data-find-game-form-title]')
  const submitButton = form.querySelector('[data-find-game-submit]')
  const cancelButton = form.querySelector('[data-find-game-cancel-edit]')
  const locationInput = form.querySelector('input[name="location"]')
  const notifyInput = form.querySelector('input[name="notify_others"]')

  form.reset()

  if (actionInput) {
    actionInput.value = 'post_game'
  }

  if (gameIdInput) {
    gameIdInput.value = ''
  }

  if (dateInput) {
    dateInput.value = ''
  }

  if (locationInput) {
    locationInput.value = 'Hawkesbury'
  }

  if (notifyInput) {
    notifyInput.checked = true
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

function editFindGameFromList(button) {
  const game = currentFindGamesById.get(String(button.dataset.gameId))
  const tool = button.closest('[data-find-game-tool]')
  const form = tool?.querySelector('[data-find-game-form]')

  if (!game || !form) {
    return
  }

  const actionInput = form.querySelector('input[name="action"]')
  const gameIdInput = form.querySelector('input[name="game_id"]')
  const dateInput = form.querySelector('input[name="game_date"]')
  const title = form.querySelector('[data-find-game-form-title]')
  const submitButton = form.querySelector('[data-find-game-submit]')
  const cancelButton = form.querySelector('[data-find-game-cancel-edit]')

  form.classList.remove('is-hidden')

  if (actionInput) {
    actionInput.value = 'update_game'
  }

  if (gameIdInput) {
    gameIdInput.value = game.id
  }

  if (dateInput) {
    dateInput.value = game.gameDate || ''
  }

  form.querySelector('input[name="game_time"]').value = game.gameTime || ''
  form.querySelector('select[name="game_holes"]').value = String(game.gameHoles || 9)
  form.querySelector('input[name="spots_open"]').value = Number(game.spotsOpen || 1)
  form.querySelector('select[name="game_path"]').value = game.gamePath || 'EVERYONE'
  form.querySelector('input[name="min_age"]').value = game.minAge || ''
  form.querySelector('input[name="max_age"]').value = game.maxAge || ''
  form.querySelector('input[name="location"]').value = game.location || 'Hawkesbury'
  form.querySelector('textarea[name="round_details"]').value = game.roundDetails || ''
  const notifyInput = form.querySelector('input[name="notify_others"]')

  if (notifyInput) {
    notifyInput.checked = true
  }

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

    resetFindGameForm(form)
    renderFindGamesState(tool, result.games || [], language)
    renderFindGameTextPreview(tool, null, language)
    setFindGameTextModalOpen(tool, false)

    if (status) {
      status.textContent = `${result.message || FIND_GAME_COPY[language].saved}${getTextResultsSummary(result, language)}`
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
  const action = button.dataset.findGameAction || 'join'

  if (action === 'delete_game' && !window.confirm(FIND_GAME_COPY[language].removeConfirm)) {
    return
  }

  formData.append('action', action)
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
    renderFindGameTextPreview(tool, null, language)

    if (action === 'delete_game') {
      resetFindGameForm(tool?.querySelector('[data-find-game-form]'))
    }

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
    form.querySelector('input[name="notify_others"]') && (form.querySelector('input[name="notify_others"]').checked = true)
    initializeDatePickers(form)
    renderLessonsState(tool, result, language)
    renderFindGameTextPreview(tool, null, language)
    setFindGameTextModalOpen(tool, false)

    if (status) {
      status.textContent = `${result.message || LESSON_COPY[language].saved}${getTextResultsSummary(result, language)}`
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

async function handleLessonMessageSubmit(form) {
  const tool = form.closest('[data-lesson-tool]')
  const language = getLanguage()
  const status = tool?.querySelector('[data-lesson-status]')
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

    renderLessonsState(tool, result, language)
    renderFindGameTextPreview(tool, result.textResults?.dryRun ? result.textResults : null, language)
    setFindGameTextModalOpen(tool, Boolean(result.textResults?.dryRun))

    if (status) {
      status.textContent = `${result.message || LESSON_COPY[language].saved}${getTextResultsSummary(result, language)}`
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

  const trackScoreToggle = event.target.closest('[data-track-score-toggle]')

  if (trackScoreToggle) {
    handleTrackScoreToggle(trackScoreToggle)
    return
  }

  const scoreStartRoundToggle = event.target.closest('[data-score-start-round-toggle]')

  if (scoreStartRoundToggle) {
    handleScoreStartRoundToggle(scoreStartRoundToggle)
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

  const adminMemberTextSend = event.target.closest('[data-admin-member-text-send]')

  if (adminMemberTextSend) {
    const panel = adminMemberTextSend.closest('[data-admin-member-text-panel]')

    if (panel) {
      handleAdminMemberManualText(panel)
    }

    return
  }

  const adminMemberTextOpen = event.target.closest('[data-admin-member-text-open]')

  if (adminMemberTextOpen) {
    const panel = adminMemberTextOpen.closest('[data-admin-member-text-panel]')

    setAdminMemberTextModalOpen(panel, true)
    return
  }

  const adminMemberTextClose = event.target.closest('[data-admin-member-text-close]')

  if (adminMemberTextClose) {
    const panel = adminMemberTextClose.closest('[data-admin-member-text-panel]')

    setAdminMemberTextModalOpen(panel, false)
    return
  }

  const adminMemberTextModal = event.target.closest('[data-admin-member-text-modal]')

  if (adminMemberTextModal && event.target === adminMemberTextModal) {
    const panel = adminMemberTextModal.closest('[data-admin-member-text-panel]')

    setAdminMemberTextModalOpen(panel, false)
    return
  }

  const adminCreateToggle = event.target.closest('[data-admin-create-toggle]')

  if (adminCreateToggle) {
    const panel = adminCreateToggle.closest('[data-admin-panel]')
    const form = panel?.querySelector('[data-admin-create-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    adminCreateToggle.textContent = isHidden
      ? adminCreateToggle.dataset.showLabel
      : adminCreateToggle.dataset.hideLabel
    adminCreateToggle.setAttribute('aria-expanded', String(!isHidden))
    return
  }

  const adminScoreToggle = event.target.closest('[data-admin-score-toggle]')

  if (adminScoreToggle) {
    const tool = adminScoreToggle.closest('[data-scores-tool]')
    const form = tool?.querySelector('[data-admin-score-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    adminScoreToggle.textContent = isHidden
      ? adminScoreToggle.dataset.showLabel
      : adminScoreToggle.dataset.hideLabel
    adminScoreToggle.setAttribute('aria-expanded', String(!isHidden))
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

  const findGameTextClose = event.target.closest('[data-find-game-text-close]')

  if (findGameTextClose) {
    const tool = findGameTextClose.closest('[data-find-game-tool], [data-events-tool], [data-lesson-tool]')

    setFindGameTextModalOpen(tool, false)
    return
  }

  const findGameTextModal = event.target.closest('[data-find-game-text-modal]')

  if (findGameTextModal && event.target === findGameTextModal) {
    const tool = findGameTextModal.closest('[data-find-game-tool], [data-events-tool], [data-lesson-tool]')

    setFindGameTextModalOpen(tool, false)
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
    renderAdminMembers(panel, currentAdminMembers, getLanguage())
    return
  }

  const adminReportPath = event.target.closest('[data-admin-report-path]')

  if (adminReportPath) {
    const path = adminReportPath.dataset.adminReportPath || 'CUP'
    const pointsTool = adminReportPath.closest('[data-admin-points-report]')
    const roundsTool = adminReportPath.closest('[data-admin-rounds-report]')

    if (pointsTool) {
      currentAdminPointsPath = path
      loadPoints(pointsTool, getLanguage())
      return
    }

    if (roundsTool) {
      currentAdminRoundsPath = path
      loadScores(roundsTool, getLanguage())
      return
    }
  }

  const adminPointsReportToggle = event.target.closest('[data-admin-points-report-toggle]')

  if (adminPointsReportToggle) {
    const tool = adminPointsReportToggle.closest('[data-admin-points-report]')
    const memberId = Number(adminPointsReportToggle.dataset.memberId || 0)

    if (expandedAdminPointsMembers.has(memberId)) {
      expandedAdminPointsMembers.delete(memberId)
    } else {
      expandedAdminPointsMembers.add(memberId)
    }

    loadPoints(tool, getLanguage())
    return
  }

  const adminRoundsToggle = event.target.closest('[data-admin-rounds-toggle]')

  if (adminRoundsToggle) {
    const tool = adminRoundsToggle.closest('[data-admin-rounds-report]')
    const memberId = Number(adminRoundsToggle.dataset.memberId || 0)

    if (expandedAdminRoundMembers.has(memberId)) {
      expandedAdminRoundMembers.delete(memberId)
    } else {
      expandedAdminRoundMembers.add(memberId)
    }

    loadScores(tool, getLanguage())
    return
  }

  const adminRoundsAllToggle = event.target.closest('[data-admin-rounds-all-toggle]')

  if (adminRoundsAllToggle) {
    const tool = adminRoundsAllToggle.closest('[data-admin-rounds-report]')
    const memberId = Number(adminRoundsAllToggle.dataset.memberId || 0)

    if (showAllAdminRoundMembers.has(memberId)) {
      showAllAdminRoundMembers.delete(memberId)
    } else {
      showAllAdminRoundMembers.add(memberId)
    }

    loadScores(tool, getLanguage())
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

  const registerNewJuniorButton = event.target.closest('[data-register-new-junior]')

  if (registerNewJuniorButton) {
    resetJoinCreatedState(registerNewJuniorButton.closest('[data-account-form="join"]'), true)
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

  const pointsListToggle = event.target.closest('[data-points-list-toggle]')

  if (pointsListToggle) {
    const pointsList = pointsListToggle.closest('[data-points-list]')
    const language = getLanguage()
    const pointsTool = siteContent.pageMap.get('points').pointsTool
    const isExpanded = pointsList.classList.toggle('is-expanded')
    const label = pointsListToggle.querySelector('span')

    pointsListToggle.setAttribute('aria-expanded', String(isExpanded))

    if (label) {
      label.textContent = isExpanded ? pointsTool.showLatest[language] : pointsTool.showAll[language]
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

  const adminPointsEntryToggle = event.target.closest('[data-admin-points-entry-toggle]')

  if (adminPointsEntryToggle) {
    const tool = adminPointsEntryToggle.closest('[data-points-tool]')
    const form = tool?.querySelector('[data-admin-points-entry-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    adminPointsEntryToggle.textContent = isHidden
      ? adminPointsEntryToggle.dataset.showLabel
      : adminPointsEntryToggle.dataset.hideLabel
    adminPointsEntryToggle.setAttribute('aria-expanded', String(!isHidden))
    return
  }

  const rankingTab = event.target.closest('[data-ranking-tab]')

  if (rankingTab) {
    const tool = rankingTab.closest('[data-ranking-tool]')
    const tabId = rankingTab.dataset.rankingTab

    tool?.querySelectorAll('[data-ranking-tab]').forEach((button) => {
      const isActive = button.dataset.rankingTab === tabId

      button.classList.toggle('active', isActive)
      button.setAttribute('aria-selected', String(isActive))
    })

    tool?.querySelectorAll('[data-ranking-panel]').forEach((panel) => {
      const isActive = panel.dataset.rankingPanel === tabId

      panel.classList.toggle('active', isActive)
      panel.hidden = !isActive
    })

    return
  }

  const rankingRoundToggle = event.target.closest('[data-ranking-round-toggle]')

  if (rankingRoundToggle) {
    const tool = rankingRoundToggle.closest('[data-ranking-tool]')
    const memberId = Number(rankingRoundToggle.dataset.memberId || 0)

    if (expandedRankingRoundMembers.has(memberId)) {
      expandedRankingRoundMembers.delete(memberId)
    } else {
      expandedRankingRoundMembers.add(memberId)
    }

    if (tool && currentRankingResult) {
      renderRankingState(tool, currentRankingResult, getLanguage())
    }

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

  const findGameEditButton = event.target.closest('[data-find-game-edit]')

  if (findGameEditButton) {
    event.preventDefault()
    editFindGameFromList(findGameEditButton)
    return
  }

  const findGameCancelEditButton = event.target.closest('[data-find-game-cancel-edit]')

  if (findGameCancelEditButton) {
    event.preventDefault()
    resetFindGameForm(findGameCancelEditButton.closest('[data-find-game-form]'))
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

  const lessonMessageToggle = event.target.closest('[data-lesson-message-toggle]')

  if (lessonMessageToggle) {
    const card = lessonMessageToggle.closest('li')
    const form = card?.querySelector('[data-lesson-message-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    lessonMessageToggle.textContent = isHidden
      ? lessonMessageToggle.dataset.showLabel
      : lessonMessageToggle.dataset.hideLabel
    lessonMessageToggle.setAttribute('aria-expanded', String(!isHidden))
    form?.querySelector('textarea[name="message"]')?.focus()
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

  const eventAddPlayerToggle = event.target.closest('[data-event-add-player-toggle]')

  if (eventAddPlayerToggle) {
    const card = eventAddPlayerToggle.closest('li')
    const form = card?.querySelector('[data-event-add-player-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    eventAddPlayerToggle.textContent = isHidden
      ? eventAddPlayerToggle.dataset.showLabel
      : eventAddPlayerToggle.dataset.hideLabel
    eventAddPlayerToggle.setAttribute('aria-expanded', String(!isHidden))
    return
  }

  const eventTeamToggle = event.target.closest('[data-event-team-toggle]')

  if (eventTeamToggle) {
    const card = eventTeamToggle.closest('li')
    const form = card?.querySelector('[data-event-team-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    eventTeamToggle.textContent = isHidden
      ? eventTeamToggle.dataset.showLabel
      : eventTeamToggle.dataset.hideLabel
    eventTeamToggle.setAttribute('aria-expanded', String(!isHidden))
    form?.querySelector('[data-event-team-name]')?.focus()
    return
  }

  const eventTeamCreate = event.target.closest('[data-event-team-create]')

  if (eventTeamCreate) {
    event.preventDefault()
    createEventTeam(eventTeamCreate)
    return
  }

  const eventFormatChoice = event.target.closest('[data-event-format-choice]')

  if (eventFormatChoice) {
    event.preventDefault()
    setEventAdminFormat(eventFormatChoice)
    return
  }

  const eventTeamDelete = event.target.closest('[data-event-team-delete]')

  if (eventTeamDelete) {
    event.preventDefault()
    deleteEventTeam(eventTeamDelete)
    return
  }

  const eventTeamPublish = event.target.closest('[data-event-team-publish]')

  if (eventTeamPublish) {
    const form = eventTeamPublish.closest('[data-event-team-form]')
    const publishedInput = form?.querySelector('[data-event-teams-published]')

    event.preventDefault()
    if (publishedInput) {
      publishedInput.value = '1'
    }
    form?.requestSubmit()
    return
  }

  const eventTeamUnpublish = event.target.closest('[data-event-team-unpublish]')

  if (eventTeamUnpublish) {
    const form = eventTeamUnpublish.closest('[data-event-team-form]')
    const publishedInput = form?.querySelector('[data-event-teams-published]')

    event.preventDefault()
    if (publishedInput) {
      publishedInput.value = '0'
    }
    form?.requestSubmit()
    return
  }

  const eventTeamPlayer = event.target.closest('[data-event-team-player]')

  if (eventTeamPlayer) {
    if (event.target.closest('[data-event-team-player-time]')) {
      return
    }

    const form = eventTeamPlayer.closest('[data-event-team-form]')

    event.preventDefault()
    form?.querySelectorAll('[data-event-team-player].is-selected').forEach((player) => {
      player.classList.remove('is-selected')
    })
    eventTeamPlayer.classList.add('is-selected')
    if (form) {
      form.dataset.selectedMemberId = eventTeamPlayer.dataset.memberId || ''
    }
    return
  }

  const eventTeamDropzone = event.target.closest('[data-event-team-dropzone]')

  if (eventTeamDropzone) {
    const form = eventTeamDropzone.closest('[data-event-team-form]')
    const selectedMemberId = form?.dataset.selectedMemberId || ''
    const selectedPlayer = [...(form?.querySelectorAll('[data-event-team-player]') || [])]
      .find((candidate) => candidate.dataset.memberId === selectedMemberId)

    if (selectedPlayer) {
      event.preventDefault()
      moveEventTeamPlayer(selectedPlayer, eventTeamDropzone, getLanguage())
      selectedPlayer.classList.remove('is-selected')
      if (form) {
        form.dataset.selectedMemberId = ''
      }
    }
    return
  }

  const eventMessageToggle = event.target.closest('[data-event-message-toggle]')

  if (eventMessageToggle) {
    const card = eventMessageToggle.closest('li')
    const form = card?.querySelector('[data-event-message-form]')
    const isHidden = form?.classList.toggle('is-hidden')

    eventMessageToggle.textContent = isHidden
      ? eventMessageToggle.dataset.showLabel
      : eventMessageToggle.dataset.hideLabel
    eventMessageToggle.setAttribute('aria-expanded', String(!isHidden))
    form?.querySelector('textarea[name="message"]')?.focus()
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

document.addEventListener('change', (event) => {
  const publicStatsChoice = event.target.closest('[data-account-public-stats]')

  if (publicStatsChoice) {
    const form = publicStatsChoice.closest('form')
    const publicStatsValue = form?.querySelector('[data-account-public-stats-value]')

    if (publicStatsValue) {
      publicStatsValue.value = publicStatsChoice.value === '1' ? '1' : '0'
    }
  }

  const scoreFormat = event.target.closest('[data-score-format]')

  if (scoreFormat) {
    updateScoreFormForFormat(scoreFormat.closest('[data-score-form]'), getLanguage())
  }

  const trackScoreFormat = event.target.closest('[data-track-score-format]')

  if (trackScoreFormat) {
    updateTrackScorePanel(trackScoreFormat.closest('[data-track-score-form]'), getLanguage())
  }

  const trackScoreHoles = event.target.closest('[data-track-score-holes]')

  if (trackScoreHoles) {
    updateTrackScoreHoleCount(trackScoreHoles.closest('[data-track-score-form]'), getLanguage())
  }
})

document.addEventListener('dragstart', (event) => {
  const player = event.target.closest('[data-event-team-player]')

  if (!player) {
    return
  }

  event.dataTransfer?.setData('text/plain', player.dataset.memberId || '')
  event.dataTransfer?.setData('application/x-event-team-player', player.dataset.memberId || '')
  event.dataTransfer.effectAllowed = 'move'
  player.classList.add('is-dragging')
})

document.addEventListener('dragend', (event) => {
  event.target.closest('[data-event-team-player]')?.classList.remove('is-dragging')
  document.querySelectorAll('[data-event-team-dropzone].is-drop-target').forEach((zone) => {
    zone.classList.remove('is-drop-target')
  })
})

document.addEventListener('dragover', (event) => {
  const zone = event.target.closest('[data-event-team-dropzone]')

  if (!zone) {
    return
  }

  event.preventDefault()
  zone.classList.add('is-drop-target')
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
})

document.addEventListener('dragleave', (event) => {
  const zone = event.target.closest('[data-event-team-dropzone]')

  if (zone && !zone.contains(event.relatedTarget)) {
    zone.classList.remove('is-drop-target')
  }
})

document.addEventListener('drop', (event) => {
  const zone = event.target.closest('[data-event-team-dropzone]')
  const memberId = event.dataTransfer?.getData('application/x-event-team-player') || event.dataTransfer?.getData('text/plain')

  if (!zone || !memberId) {
    return
  }

  const form = zone.closest('[data-event-team-form]')
  const player = [...(form?.querySelectorAll('[data-event-team-player]') || [])]
    .find((candidate) => candidate.dataset.memberId === memberId)

  event.preventDefault()
  zone.classList.remove('is-drop-target')
  moveEventTeamPlayer(player, zone, getLanguage())
})

document.addEventListener('submit', (event) => {
  const liveCodeForm = event.target.closest('[data-live-code-form]')

  if (liveCodeForm) {
    event.preventDefault()
    handleLiveCodeSubmit(liveCodeForm)
    return
  }

  const liveScoreForm = event.target.closest('[data-live-score-form]')

  if (liveScoreForm) {
    event.preventDefault()
    handleLiveScoreSubmit(liveScoreForm)
    return
  }

  const trackScoreForm = event.target.closest('[data-track-score-form]')

  if (trackScoreForm) {
    event.preventDefault()
    handleTrackScoreSubmit(trackScoreForm)
    return
  }

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

  const adminPointsEntryForm = event.target.closest('[data-admin-points-entry-form]')

  if (adminPointsEntryForm) {
    event.preventDefault()
    handleAdminPointsEntrySubmit(adminPointsEntryForm)
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

  const lessonMessageForm = event.target.closest('[data-lesson-message-form]')

  if (lessonMessageForm) {
    event.preventDefault()
    handleLessonMessageSubmit(lessonMessageForm)
    return
  }

  const eventForm = event.target.closest('[data-event-form]')

  if (eventForm) {
    event.preventDefault()
    handleEventSubmit(eventForm)
    return
  }

  const eventAddPlayerForm = event.target.closest('[data-event-add-player-form]')

  if (eventAddPlayerForm) {
    event.preventDefault()
    handleEventAddPlayerSubmit(eventAddPlayerForm)
    return
  }

  const eventTeamForm = event.target.closest('[data-event-team-form]')

  if (eventTeamForm) {
    event.preventDefault()
    handleEventTeamSubmit(eventTeamForm)
    return
  }

  const eventScoreEditForm = event.target.closest('[data-event-score-edit-form]')

  if (eventScoreEditForm) {
    event.preventDefault()
    handleEventScoreEditSubmit(eventScoreEditForm)
    return
  }

  const eventMessageForm = event.target.closest('[data-event-message-form]')

  if (eventMessageForm) {
    event.preventDefault()
    handleEventMessageSubmit(eventMessageForm)
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

  const form = event.target.closest('[data-account-form]')

  if (!form) {
    return
  }

  event.preventDefault()
  handleAccountSubmit(form)
})

document.addEventListener('input', (event) => {
  const trackScoreInput = event.target.closest('[data-track-hole-score]')

  if (trackScoreInput) {
    updateTrackScorePanel(trackScoreInput.closest('[data-track-score-form], [data-live-score-form]'), getLanguage())
    return
  }

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
  const isLocalDev = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)

  if (isLocalDev) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => null)
  } else {
  const registerServiceWorker = () => navigator.serviceWorker.register('/sw.js').catch(() => null)

  if (document.readyState === 'complete') {
    registerServiceWorker()
  } else {
    window.addEventListener('load', registerServiceWorker)
  }
  }
}

window.addEventListener('hashchange', render)
await checkMemberSession()
render()
