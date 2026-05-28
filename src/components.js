import { appVersion } from './version.js'

function renderLanguageToggle(language, copy) {
  return `
    <div class="language-toggle" aria-label="${copy.languageLabel}">
      <button type="button" data-language="en" class="${language === 'en' ? 'active' : ''}">EN</button>
      <button type="button" data-language="fr" class="${language === 'fr' ? 'active' : ''}">FR</button>
    </div>
  `
}

function escapeAttribute(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function renderHeader({ routes, page, language, copy, isLoggedIn, member, isMemberPortal = false }) {
  if (isMemberPortal) {
    return renderMemberHeader(language, page, copy, member)
  }

  return `
    <header class="site-header">
      <a class="brand" href="#home" aria-label="${copy.brandHome}">
        <img class="brand-mark" src="/pwa-icon-192.png?v=20260523-1320" alt="" width="48" height="48" />
        <span>
          <strong>Hawkesbury</strong>
          <small>Junior Golf</small>
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="header-actions">
        <nav class="nav" aria-label="${copy.navLabel}">
          ${routes
            .filter((route) => !route.hideFromNav && route.id !== 'my-account')
            .map(
              (route) => {
                const navRoute = isLoggedIn && route.id === 'login'
                  ? {
                      ...route,
                      id: 'my-account',
                      title: {
                        en: 'My Account',
                        fr: 'Mon compte',
                      },
                    }
                  : route
                const isActive = navRoute.id === page.id || (navRoute.id === 'my-account' && page.accountArea)

                return `
                <a href="#${navRoute.id}" class="${isActive ? 'active' : ''}">
                  ${navRoute.title[language]}
                </a>
              `
              },
            )
            .join('')}
        </nav>
        ${renderLanguageToggle(language, copy)}
      </div>
    </header>
  `
}

function renderMemberHeader(language, page, copy, member) {
  const logoutLabel = language === 'fr' ? 'Se déconnecter' : 'Log out'
  const fullSiteLabel = language === 'fr' ? 'Quitter le portail junior' : 'Exit Junior Portal'
  const activeRoute = page?.id || 'my-account'

  return `
    <header class="site-header member-site-header">
      <a class="brand" href="#my-account" aria-label="${copy.brandHome}">
        <img class="brand-mark" src="/pwa-icon-192.png?v=20260523-1320" alt="" width="48" height="48" />
        <span>
          <strong>Hawkesbury</strong>
          <small>${language === 'fr' ? 'Espace membre' : 'Member Area'}</small>
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="header-actions">
        <nav class="nav member-site-nav" aria-label="${language === 'fr' ? 'Navigation membre' : 'Member navigation'}">
          ${renderMemberPortalNavLinks(language, activeRoute, member)}
        </nav>
        ${renderLanguageToggle(language, copy)}
        <a class="account-app-link member-full-site-link" href="/" data-session-mode-link="site">${fullSiteLabel}</a>
        <button class="account-logout member-header-logout" type="button" data-account-logout>${logoutLabel}</button>
      </div>
    </header>
  `
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

  return type || 'Member'
}

function memberCanSeeAdminPanel(member) {
  return ['SUPER_ADMIN', 'ADMIN'].includes(String(member?.membershipType || '').toUpperCase())
}

function renderAccountProfilePanel(language, member) {
  const copy = {
    en: {
      title: 'Player details',
      playerName: 'Player Name',
      stream: 'Stream',
      parentEmail: 'Parent Email',
      playerText: 'Player Text',
      parentText: 'Parent Text',
      notifications: 'Notifications',
      lessonPosted: 'Notify on Lesson Posted',
      eventPosted: 'Notify when Event Posted',
      gamePosted: 'Notify when Round Posted',
      publicStats: 'Scores, points, and rank visibility',
      displayScores: 'Display Scores',
      hideScores: 'Hide Scores',
      publicStatsNote: 'If you are taking part in a competitive team, those points must always show.',
      save: 'Save Notifications',
      loading: 'Loading account details...',
      helper: 'Choose which contact methods receive alerts when lessons, events, or rounds are posted.',
    },
    fr: {
      title: 'Détails du joueur',
      playerName: 'Nom du joueur',
      stream: 'Parcours',
      parentEmail: 'Courriel du parent',
      playerText: 'Texto du joueur',
      parentText: 'Texto du parent',
      notifications: 'Avis',
      lessonPosted: 'Aviser quand une leçon est publiée',
      eventPosted: 'Aviser quand un événement est publié',
      gamePosted: 'Aviser quand une ronde est publiée',
      publicStats: 'Visibilité des scores, points et classement',
      displayScores: 'Afficher les scores',
      hideScores: 'Masquer les scores',
      publicStatsNote: 'Si vous participez à une équipe compétitive, ces points doivent toujours être affichés.',
      save: 'Enregistrer',
      loading: 'Chargement du compte...',
      helper: 'Choisissez quelles méthodes de contact reçoivent les avis pour les leçons, événements ou rondes publiés.',
    },
  }[language]
  const playerName = [member?.firstName, member?.lastName].filter(Boolean).join(' ') || member?.username || ''

  return `
    <form class="account-profile-panel" data-account-profile-form>
      <div class="account-profile-heading">
        <h2>${copy.title}</h2>
        <p>${copy.helper}</p>
      </div>
      <div class="account-profile-grid account-profile-summary-grid">
        <label>
          <span>${copy.playerName}</span>
          <input type="text" name="player_name" value="${escapeAttribute(playerName)}" readonly />
        </label>
        <label>
          <span>${copy.stream}</span>
          <input type="text" name="stream" value="${escapeAttribute(accountStreamLabel(member?.membershipType))}" readonly />
        </label>
      </div>
      <div class="account-profile-grid account-contact-grid">
        <label>
          <span>${copy.parentEmail}</span>
          <input type="email" name="parent_email" autocomplete="email" data-account-profile-parent-email />
        </label>
        <label>
          <span>${copy.playerText}</span>
          <input type="tel" name="player_text" autocomplete="tel" data-account-profile-player-text />
        </label>
        <label>
          <span>${copy.parentText}</span>
          <input type="tel" name="parent_text" autocomplete="tel" data-account-profile-parent-text />
        </label>
      </div>
      <div class="account-notification-matrix" aria-label="${copy.notifications}">
        <div class="account-notification-row account-notification-head">
          <span>${copy.notifications}</span>
          <span>${copy.parentEmail}</span>
          <span>${copy.playerText}</span>
          <span>${copy.parentText}</span>
        </div>
        ${[
          ['lessons', copy.lessonPosted],
          ['events', copy.eventPosted],
          ['games', copy.gamePosted],
        ].map(([key, label]) => `
          <div class="account-notification-row">
            <strong>${label}</strong>
            <label><input type="checkbox" name="notify_${key}_parent_email" data-notification-setting /><span>${copy.parentEmail}</span></label>
            <label><input type="checkbox" name="notify_${key}_player_text" data-notification-setting /><span>${copy.playerText}</span></label>
            <label><input type="checkbox" name="notify_${key}_parent_text" data-notification-setting /><span>${copy.parentText}</span></label>
          </div>
        `).join('')}
      </div>
      <fieldset class="account-public-stats-toggle">
        <legend>${copy.publicStats}</legend>
        <div class="account-public-stats-options">
          <label>
            <input type="radio" name="show_public_stats_choice" value="1" data-account-public-stats data-public-stats-display checked />
            <span>${copy.displayScores}</span>
          </label>
          <label>
            <input type="radio" name="show_public_stats_choice" value="0" data-account-public-stats data-public-stats-hide />
            <span>${copy.hideScores}</span>
          </label>
        </div>
        <input type="hidden" name="show_public_stats" value="1" data-account-public-stats-value />
        <p>${copy.publicStatsNote}</p>
      </fieldset>
      <div class="account-profile-actions">
        <button type="submit">${copy.save}</button>
        <p class="score-status" data-account-profile-status aria-live="polite">${copy.loading}</p>
      </div>
    </form>
  `
}

function renderAdminPanel(language, isHidden = true, member = null) {
  const memberType = String(member?.membershipType || '').toUpperCase()
  const canManageMembers = memberCanSeeAdminPanel(member)
  const canSuperAdmin = memberType === 'SUPER_ADMIN'
  const copy = {
    en: {
      title: 'Admin Panel',
      helper: 'Update member profiles, contact details, roles, status, and notifications.',
      loading: 'Loading members...',
      staff: 'Staff',
      cup: 'Member',
      community: 'Community',
      inactive: 'Inactive',
      sendText: 'Send Text',
      createTitle: 'Create Account',
      createHelper: 'Create a verified account for a junior, coach, teacher, or admin.',
      showCreate: 'Create Account',
      hideCreate: 'Hide Account Form',
      firstName: 'First Name',
      lastName: 'Last Name',
      parentEmail: 'Parent Email',
      username: 'Username',
      password: 'Password',
      age: 'Age',
      path: 'Path',
      createAccount: 'Create Account',
      textTitle: 'Send Text',
      textHelper: 'Live sending is on. Your monitoring number will also receive every send.',
      targetLabel: 'Send to',
      all: 'All',
      parents: 'Parents',
      juniors: 'Juniors',
      messageLabel: 'Message',
      messagePlaceholder: 'Example: Hi {name}, practice starts at 6 PM.',
      cancel: 'Cancel',
      send: 'Send',
    },
    fr: {
      title: 'Panneau admin',
      helper: 'Mettez à jour les profils, coordonnées, rôles, statuts et avis.',
      loading: 'Chargement des membres...',
      staff: 'Personnel',
      cup: 'Membre',
      community: 'Communauté',
      inactive: 'Inactifs',
      sendText: 'Envoyer texto',
      createTitle: 'Créer un compte',
      createHelper: 'Créez un compte vérifié pour un junior, entraîneur, enseignant ou admin.',
      showCreate: 'Créer un compte',
      hideCreate: 'Masquer le formulaire',
      firstName: 'Prénom',
      lastName: 'Nom',
      parentEmail: 'Courriel parent',
      username: 'Nom utilisateur',
      password: 'Mot de passe',
      age: 'Âge',
      path: 'Parcours',
      createAccount: 'Créer le compte',
      textTitle: 'Envoyer texto',
      textHelper: 'L’envoi réel est activé. Votre numéro de surveillance recevra aussi chaque envoi.',
      targetLabel: 'Envoyer à',
      all: 'Tous',
      parents: 'Parents',
      juniors: 'Juniors',
      messageLabel: 'Message',
      messagePlaceholder: 'Exemple : Bonjour {name}, la pratique commence à 18 h.',
      cancel: 'Annuler',
      send: 'Envoyer',
    },
  }[language]

  return `
    <section class="account-admin-panel ${isHidden ? 'is-hidden' : ''}" data-admin-panel>
      <div class="account-profile-heading">
        <h2>${copy.title}</h2>
        <p>${copy.helper}</p>
      </div>
      <div class="admin-toolbar">
        ${canSuperAdmin ? `<button type="button" data-admin-create-toggle data-show-label="${copy.showCreate}" data-hide-label="${copy.hideCreate}" aria-expanded="false">${copy.showCreate}</button>` : ''}
        <button type="button" data-admin-text-open>${copy.sendText}</button>
      </div>
      ${canSuperAdmin ? `<form class="admin-create-form admin-manage-form is-hidden" data-admin-member-form data-admin-create-form>
        <input type="hidden" name="action" value="create_member" />
        <div class="admin-create-heading">
          <span>
            <h3>${copy.createTitle}</h3>
            <p>${copy.createHelper}</p>
          </span>
        </div>
        <div class="form-grid two-column">
          <label><span>${copy.firstName}</span><input type="text" name="first_name" autocomplete="given-name" required /></label>
          <label><span>${copy.lastName}</span><input type="text" name="last_name" autocomplete="family-name" required /></label>
          <label><span>${copy.parentEmail}</span><input type="email" name="parent_email" autocomplete="email" /></label>
          <label><span>${copy.username}</span><input type="text" name="username" autocomplete="username" required /></label>
          <label><span>${copy.password}</span><input type="password" name="password" autocomplete="new-password" minlength="8" required /></label>
          <label><span>${copy.age}</span><input type="number" name="player_age" min="1" max="18" inputmode="numeric" /></label>
          <label>
            <span>${copy.path}</span>
            <select name="membership_type">
              <option value="COMMUNITY">Community</option>
              <option value="CUP">Member</option>
              <option value="COACH">Coach</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        <button type="submit">${copy.createAccount}</button>
      </form>` : ''}
      <div class="admin-text-modal is-hidden" data-admin-text-modal aria-hidden="true">
        <div class="admin-text-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-text-title">
          <form data-admin-text-form>
            <div class="admin-text-heading">
              <span>
                <h3 id="admin-text-title">${copy.textTitle}</h3>
                <p>${copy.textHelper}</p>
              </span>
              <button type="button" data-admin-text-close aria-label="${copy.cancel}">&times;</button>
            </div>
            <label>
              <span>${copy.targetLabel}</span>
              <select name="target">
                <option value="all">${copy.all}</option>
                <option value="parents">${copy.parents}</option>
                <option value="juniors">${copy.juniors}</option>
              </select>
            </label>
            <label>
              <span>${copy.messageLabel}</span>
              <textarea name="message" rows="5" placeholder="${copy.messagePlaceholder}" required></textarea>
            </label>
            <div class="admin-text-actions">
              <button type="button" data-admin-text-close>${copy.cancel}</button>
              <button type="submit">${copy.send}</button>
            </div>
            <div class="admin-text-results" data-admin-text-results aria-live="polite"></div>
          </form>
        </div>
      </div>
      ${canManageMembers ? `
      <div class="admin-filter-tabs" role="tablist" aria-label="${copy.title}">
        <button type="button" class="active" data-admin-filter="staff"><span>${copy.staff}</span><small data-admin-filter-count="staff">0</small></button>
        <button type="button" data-admin-filter="cup"><span>${copy.cup}</span><small data-admin-filter-count="cup">0</small></button>
        <button type="button" data-admin-filter="community"><span>${copy.community}</span><small data-admin-filter-count="community">0</small></button>
        <button type="button" data-admin-filter="inactive"><span>${copy.inactive}</span><small data-admin-filter-count="inactive">0</small></button>
      </div>
      <div class="admin-members-list" data-admin-members data-empty-label="${copy.loading}">
        <p>${copy.loading}</p>
      </div>` : ''}
      <p class="score-status" data-admin-status aria-live="polite"></p>
    </section>
  `
}

function renderAccountPage(page, language, member, copy, isMemberPortal = false) {
  const logoutLabel = language === 'fr' ? 'Se déconnecter' : 'Log out'
  const loadAppLabel = language === 'fr' ? 'Charger comme application' : 'LOAD AS AN APP'
  return `
    <section class="account-page">
      <div class="account-rule"></div>
      <div class="account-heading-row">
        <div>
          <p class="eyebrow">${page.eyebrow[language]}</p>
          <div class="account-title-row">
            <h1>${page.heading[language]}</h1>
            <a class="account-app-link account-title-app-link" href="/members#my-account" data-session-mode-link="app">${loadAppLabel}</a>
          </div>
          <p>${page.intro[language]}</p>
        </div>
        <div class="account-top-actions">
          ${isMemberPortal ? '' : `<button class="account-logout" type="button" data-account-logout>${logoutLabel}</button>`}
        </div>
      </div>
      ${isMemberPortal ? '' : `<nav class="account-link-grid" aria-label="${page.title[language]}">
        ${isMemberPortal
          ? renderMemberPortalNavLinks(language, 'my-account')
          : page.accountLinks
            .map((link) => `<a href="#${link.route}">${link.label[language]}</a>`)
            .join('')}
      </nav>`}
      ${renderAccountProfilePanel(language, member)}
    </section>
  `
}

function renderAdminPage(page, language, member) {
  return `
    <section class="account-page account-admin-page">
      <div class="account-rule"></div>
      <div class="account-heading-row">
        <div>
          <p class="eyebrow">${page.eyebrow[language]}</p>
          <h1>${page.heading[language]}</h1>
          <p>${page.intro[language]}</p>
        </div>
      </div>
      ${renderAdminPanel(language, false, member)}
    </section>
  `
}

function renderMemberPortalNav(language) {
  const activeRoute = window.location.hash.replace('#', '') || 'my-account'
  const linkHtml = renderMemberPortalNavLinks(language, activeRoute)

  return `
    <nav class="account-link-grid member-portal-nav" aria-label="${language === 'fr' ? 'Navigation membre' : 'Member navigation'}">
      ${linkHtml}
    </nav>
  `
}

function renderMemberPortalNavLinks(language, activeRoute = 'my-account', member = null) {
  const links = [
    ['my-account', language === 'fr' ? 'Profil' : 'Profile'],
    ['scores', language === 'fr' ? 'Scores' : 'Scores'],
    ['points', language === 'fr' ? 'Points' : 'Points'],
    ['events', language === 'fr' ? 'Événements' : 'Events'],
    ['find-a-game', language === 'fr' ? 'Trouver une ronde' : 'Find a Round'],
    ['book-a-lesson', language === 'fr' ? 'Réserver une leçon' : 'Book a Lesson'],
    ['ranking', language === 'fr' ? 'Classement' : 'Ranking'],
  ]

  if (memberCanSeeAdminPanel(member)) {
    links.push(['admin-panel', language === 'fr' ? 'Panneau admin' : 'Admin Panel'])
  }

  return links.map(([route, label]) => `<a href="#${route}" class="${route === activeRoute ? 'active' : ''}">${label}</a>`).join('')
}

function renderAccountSubpage(page, language, member, isMemberPortal = false) {
  const backLabel = language === 'fr' ? 'Retour à Mon compte' : 'Back to My Account'

  return `
    <section class="account-page account-subpage account-${page.id}-page">
      ${isMemberPortal ? '' : `<a class="account-back-link" href="#my-account">${backLabel}</a>`}
      <h1>${page.heading[language]}</h1>
      <p>${page.intro[language]}</p>
      ${page.id === 'scores' ? renderScoresTool(page, language, member) : ''}
      ${page.id === 'points' ? renderPointsTool(page, language, member) : ''}
      ${page.id === 'events' ? renderEventsTool(page, language, member) : ''}
      ${page.id === 'find-a-game' ? renderFindGameTool(page, language, member) : ''}
      ${page.id === 'book-a-lesson' ? renderLessonTool(page, language, member) : ''}
      ${page.id === 'ranking' ? renderRankingTool(page, language) : ''}
    </section>
  `
}

function renderRankingTool(page, language) {
  const rankingTool = page.rankingTool
  const tabs = [
    ['points', rankingTool.pointsTab[language], rankingTool.pointsTitle[language]],
    ['rounds', rankingTool.roundsTab[language], rankingTool.roundsTitle[language]],
    ['scores', rankingTool.scoresTab[language], rankingTool.scoresTitle[language]],
    ['travel-team', rankingTool.travelTeamTab[language], rankingTool.travelTeamTitle[language]],
  ]

  return `
    <section class="ranking-tool" data-ranking-tool>
      <div class="ranking-tabs" role="tablist" aria-label="${rankingTool.tabsLabel[language]}">
        ${tabs.map(([id, label], index) => `
          <button
            type="button"
            class="${index === 0 ? 'active' : ''}"
            role="tab"
            id="ranking-tab-${id}"
            aria-selected="${index === 0 ? 'true' : 'false'}"
            aria-controls="ranking-panel-${id}"
            data-ranking-tab="${id}"
          >${label}</button>
        `).join('')}
      </div>
      ${tabs.map(([id, label, title], index) => `
        <section
          class="ranking-panel ${index === 0 ? 'active' : ''}"
          role="tabpanel"
          id="ranking-panel-${id}"
          aria-labelledby="ranking-tab-${id}"
          ${index === 0 ? '' : 'hidden'}
          data-ranking-panel="${id}"
        >
          <div class="admin-report-heading">
            <h2>${title}</h2>
            <span>${label}</span>
          </div>
          <p class="ranking-note">${rankingTool.cupOnly[language]}</p>
          <div class="ranking-list" data-ranking-list="${id}">
            <p>${rankingTool.loading[language]}</p>
          </div>
        </section>
      `).join('')}
    </section>
  `
}

function renderLessonDateField(name, label) {
  return `
    <div class="score-field">
      <span>${label}</span>
      <div class="date-picker" data-date-picker>
        <input type="hidden" name="${name}" required data-date-input />
        <button class="date-picker-button" type="button" data-date-picker-toggle aria-expanded="false">
          <span data-date-picker-label></span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
          </svg>
        </button>
        <div class="date-picker-popover" data-date-picker-popover></div>
      </div>
    </div>
  `
}

function renderLessonTypeSelect(lessonTool, language) {
  return `
    <label>
      <span>${lessonTool.typeLabel[language]}</span>
      <select name="lesson_type" required>
        <option value="SINGLE">${lessonTool.singleOption[language]}</option>
        <option value="GROUP">${lessonTool.groupOption[language]}</option>
      </select>
    </label>
  `
}

function renderPathSelect(name, label, pathOptions, language, member, includeAllPaths = false) {
  const memberType = String(member?.membershipType || '').toUpperCase()
  const values = includeAllPaths || memberType === 'SUPER_ADMIN'
    ? ['EVERYONE', 'CUP', 'COMMUNITY']
    : ['EVERYONE', memberType].filter((value, index, list) => (
        ['EVERYONE', 'CUP', 'COMMUNITY'].includes(value) && list.indexOf(value) === index
      ))

  return `
    <label>
      <span>${label}</span>
      <select name="${name}" required>
        ${values.map((value) => `<option value="${value}">${pathOptions[value.toLowerCase()]?.[language] || value}</option>`).join('')}
      </select>
    </label>
  `
}

function renderLessonTool(page, language, member) {
  const lessonTool = page.lessonTool
  const canTeach = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'COACH'].includes(member?.membershipType)
  const canRequestLesson = ['CUP', 'COMMUNITY'].includes(member?.membershipType)

  return `
    <section class="find-game-tool" data-lesson-tool>
      <div class="find-game-action-bar">
        ${canTeach ? `<button type="button" data-lesson-form-toggle="available" data-label="${lessonTool.availableButton[language]}">${lessonTool.availableButton[language]}</button>` : ''}
        ${canRequestLesson ? `<button type="button" data-lesson-form-toggle="request" data-label="${lessonTool.requestButton[language]}">${lessonTool.requestButton[language]}</button>` : ''}
      </div>
      ${canTeach ? `<form class="event-entry-form is-hidden" data-lesson-available-form>
        <h2>${lessonTool.availableTitle[language]}</h2>
        <input type="hidden" name="action" value="add_slot" />
        <div class="form-grid two-column">
          ${renderLessonDateField('lesson_date', lessonTool.dateLabel[language])}
          <label><span>${lessonTool.timeLabel[language]}</span><input type="time" name="lesson_time" required /></label>
          ${renderLessonTypeSelect(lessonTool, language)}
          <label><span>${lessonTool.maxLabel[language]}</span><input type="number" name="max_students" min="1" max="12" value="1" inputmode="numeric" required /></label>
          ${renderPathSelect('lesson_path', lessonTool.pathLabel[language], lessonTool.pathOptions, language, member, true)}
          <label>
            <span>${lessonTool.minAgeLabel[language]}</span>
            <input type="number" name="min_age" min="1" max="99" inputmode="numeric" placeholder="${lessonTool.noMinAgePlaceholder[language]}" />
          </label>
          <label>
            <span>${lessonTool.maxAgeLabel[language]}</span>
            <input type="number" name="max_age" min="1" max="99" inputmode="numeric" placeholder="${lessonTool.noMaxAgePlaceholder[language]}" />
          </label>
          <label><span>${lessonTool.locationLabel[language]}</span><input type="text" name="location" value="Hawkesbury" required /></label>
        </div>
        <label><span>${lessonTool.notesLabel[language]}</span><textarea name="notes" rows="3" maxlength="240"></textarea></label>
        <label class="find-game-notify-toggle">
          <input type="checkbox" name="notify_others" value="1" checked />
          <span>${lessonTool.notifyOthersLabel[language]}</span>
        </label>
        <div class="event-form-actions"><button type="submit">${lessonTool.availableSave[language]}</button></div>
      </form>` : ''}
      ${canRequestLesson ? `<form class="event-entry-form is-hidden" data-lesson-request-form>
        <h2>${lessonTool.requestTitle[language]}</h2>
        <input type="hidden" name="action" value="request_lesson" />
        <div class="form-grid two-column">
          ${renderLessonDateField('preferred_date', lessonTool.dateLabel[language])}
          <label><span>${lessonTool.timeLabel[language]}</span><input type="time" name="preferred_time" required /></label>
          ${renderLessonTypeSelect(lessonTool, language)}
        </div>
        <label><span>${lessonTool.notesLabel[language]}</span><textarea name="notes" rows="3" maxlength="240" required></textarea></label>
        <div class="event-form-actions"><button type="submit">${lessonTool.requestSave[language]}</button></div>
      </form>` : ''}
      <section class="events-list-panel">
        <div class="events-list-heading"><h2>${lessonTool.bookedListTitle[language]}</h2></div>
        <div class="events-list" data-lesson-booked data-empty-label="${lessonTool.emptyBooked[language]}"></div>
      </section>
      ${canRequestLesson ? `
      <section class="events-list-panel">
        <div class="events-list-heading"><h2>${lessonTool.availableListTitle[language]}</h2></div>
        <div class="events-list" data-lesson-slots data-empty-label="${lessonTool.emptySlots[language]}"></div>
      </section>
      ` : ''}
      <section class="events-list-panel">
        <div class="events-list-heading"><h2>${lessonTool.requestListTitle[language]}</h2></div>
        <div class="events-list" data-lesson-requests data-empty-label="${lessonTool.emptyRequests[language]}"></div>
      </section>
      <p class="score-status" data-lesson-status aria-live="polite">${lessonTool.loading[language]}</p>
      <div class="find-game-text-modal is-hidden" data-find-game-text-modal aria-hidden="true">
        <div class="find-game-text-dialog" role="dialog" aria-modal="true">
          <div class="find-game-text-dialog-content" data-find-game-text-modal-content></div>
        </div>
      </div>
    </section>
  `
}

function renderFindGameTool(page, language, member) {
  const findGameTool = page.findGameTool

  return `
    <section class="find-game-tool" data-find-game-tool>
      <div class="find-game-action-bar">
        <button type="button" data-find-game-post-toggle data-show-label="${findGameTool.postButton[language]}" data-hide-label="${findGameTool.hidePostButton[language]}">${findGameTool.postButton[language]}</button>
      </div>
      <form class="event-entry-form find-game-form is-hidden" data-find-game-form>
        <h2 data-find-game-form-title data-add-title="${findGameTool.formTitle[language]}" data-edit-title="${findGameTool.editTitle[language]}">${findGameTool.formTitle[language]}</h2>
        <input type="hidden" name="action" value="post_game" />
        <input type="hidden" name="game_id" value="" />
        <div class="form-grid two-column">
          <div class="score-field">
            <span>${findGameTool.dateLabel[language]}</span>
            <div class="date-picker" data-date-picker>
              <input type="hidden" name="game_date" required data-date-input />
              <button class="date-picker-button" type="button" data-date-picker-toggle aria-expanded="false">
                <span data-date-picker-label></span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                </svg>
              </button>
              <div class="date-picker-popover" data-date-picker-popover></div>
            </div>
          </div>
          <label>
            <span>${findGameTool.timeLabel[language]}</span>
            <input type="time" name="game_time" required />
          </label>
          <label>
            <span>${findGameTool.holesLabel[language]}</span>
            <select name="game_holes" required>
              <option value="9">9 holes</option>
              <option value="18">18 holes</option>
            </select>
          </label>
          <label>
            <span>${findGameTool.spotsLabel[language]}</span>
            <input type="number" name="spots_open" min="1" max="12" inputmode="numeric" required />
          </label>
          ${renderPathSelect('game_path', findGameTool.pathLabel[language], findGameTool.pathOptions, language, member)}
          <label>
            <span>${findGameTool.minAgeLabel[language]}</span>
            <input type="number" name="min_age" min="1" max="99" inputmode="numeric" placeholder="${findGameTool.noMinAgePlaceholder[language]}" />
          </label>
          <label>
            <span>${findGameTool.maxAgeLabel[language]}</span>
            <input type="number" name="max_age" min="1" max="99" inputmode="numeric" placeholder="${findGameTool.noMaxAgePlaceholder[language]}" />
          </label>
          <label>
            <span>${findGameTool.locationLabel[language]}</span>
            <input type="text" name="location" value="Hawkesbury" required />
          </label>
        </div>
        <label>
          <span>${findGameTool.roundLabel[language]}</span>
          <textarea name="round_details" rows="3" maxlength="200" placeholder="${findGameTool.roundPlaceholder[language]}" required></textarea>
        </label>
        <label class="find-game-notify-toggle">
          <input type="checkbox" name="notify_others" value="1" checked />
          <span>${findGameTool.notifyOthersLabel[language]}</span>
        </label>
        <div class="event-form-actions">
          <button type="submit" data-find-game-submit data-save-label="${findGameTool.saveButton[language]}" data-update-label="${findGameTool.updateButton[language]}">${findGameTool.saveButton[language]}</button>
          <button class="event-cancel-edit is-hidden" type="button" data-find-game-cancel-edit>${findGameTool.cancelEditButton[language]}</button>
        </div>
      </form>
      <section class="events-list-panel find-game-list-panel">
        <div class="events-list-heading">
          <h2>${findGameTool.gamesTitle[language]}</h2>
        </div>
        <div class="find-game-text-preview" data-find-game-text-preview hidden></div>
        <div class="events-list" data-find-game-list data-empty-label="${findGameTool.empty[language]}"></div>
      </section>
      <p class="score-status" data-find-game-status aria-live="polite">${findGameTool.loading[language]}</p>
      <div class="find-game-text-modal is-hidden" data-find-game-text-modal aria-hidden="true">
        <div class="find-game-text-dialog" role="dialog" aria-modal="true">
          <div class="find-game-text-dialog-content" data-find-game-text-modal-content></div>
        </div>
      </div>
    </section>
  `
}

function renderEventsTool(page, language, member) {
  const eventsTool = page.eventsTool
  const memberType = String(member?.membershipType || '').toUpperCase()
  const canAddEvents = ['SUPER_ADMIN', 'ADMIN'].includes(memberType)
  const canSuperAdminEvents = memberType === 'SUPER_ADMIN'
  const adminForm = canAddEvents
    ? `
      <form class="event-entry-form is-hidden" data-event-form data-event-admin-panel>
        <input type="hidden" name="action" value="add_event" />
        <input type="hidden" name="event_id" value="" />
        <h2 data-event-form-title data-add-title="${eventsTool.addTitle[language]}" data-edit-title="${eventsTool.editTitle[language]}">${eventsTool.addTitle[language]}</h2>
        <div class="form-grid two-column">
          <label>
            <span>${eventsTool.nameLabel[language]}</span>
            <input type="text" name="event_name" maxlength="160" required />
          </label>
          <div class="score-field">
            <span>${eventsTool.dateLabel[language]}</span>
            <div class="date-picker" data-date-picker>
              <input type="hidden" name="event_date" required data-date-input />
              <button class="date-picker-button" type="button" data-date-picker-toggle aria-expanded="false">
                <span data-date-picker-label></span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                </svg>
              </button>
              <div class="date-picker-popover" data-date-picker-popover></div>
            </div>
          </div>
          <label>
            <span>${eventsTool.timeLabel[language]}</span>
            <input type="time" name="event_time" required />
          </label>
          <label>
            <span>${eventsTool.winnerPointsLabel[language]}</span>
            <input type="number" name="winner_points" min="0" max="999" inputmode="numeric" required />
          </label>
          <label>
            <span>${eventsTool.participantPointsLabel[language]}</span>
            <input type="number" name="participant_points" min="0" max="999" inputmode="numeric" required />
          </label>
          <label>
            <span>${eventsTool.maxPlayersLabel[language]}</span>
            <input type="number" name="max_players" min="1" max="999" inputmode="numeric" required />
          </label>
          <label>
            <span>${eventsTool.pathLabel[language]}</span>
            <select name="event_path" required>
              <option value="EVERYONE">${eventsTool.pathOptions.everyone[language]}</option>
              <option value="CUP">${eventsTool.pathOptions.cup[language]}</option>
              <option value="COMMUNITY">${eventsTool.pathOptions.community[language]}</option>
            </select>
          </label>
          <label>
            <span>${eventsTool.communityCostLabel[language]}</span>
            <input type="number" name="community_cost" min="0" max="9999" step="0.01" inputmode="decimal" value="0" required />
          </label>
          <label>
            <span>${eventsTool.minAgeLabel[language]}</span>
            <input type="number" name="min_age" min="1" max="99" inputmode="numeric" placeholder="${eventsTool.noMinAgePlaceholder[language]}" />
          </label>
          <label>
            <span>${eventsTool.maxAgeLabel[language]}</span>
            <input type="number" name="max_age" min="1" max="99" inputmode="numeric" placeholder="${eventsTool.noMaxAgePlaceholder[language]}" />
          </label>
          <label>
            <span>${eventsTool.locationLabel[language]}</span>
            <input type="text" name="location" value="Hawkesbury" required />
          </label>
          <label>
            <span>${eventsTool.descriptionLabel[language]}</span>
            <textarea name="description" rows="3" required></textarea>
          </label>
          <label>
            <span>${eventsTool.winnerLabel[language]}</span>
            <input type="text" name="winner" maxlength="160" />
          </label>
        </div>
        <label>
          <span>${eventsTool.attendeeCsvLabel[language]}</span>
          <textarea name="attendee_csv" rows="4" placeholder="${eventsTool.attendeeCsvPlaceholder[language]}"></textarea>
        </label>
        <label class="find-game-notify-toggle" data-event-notify-field>
          <input type="checkbox" name="notify_others" value="1" checked />
          <span>${eventsTool.notifyOthersLabel[language]}</span>
        </label>
        <div class="event-form-actions">
          <button type="submit" data-event-submit data-save-label="${eventsTool.saveButton[language]}" data-update-label="${eventsTool.updateButton[language]}">${eventsTool.saveButton[language]}</button>
          <button class="event-cancel-edit is-hidden" type="button" data-event-cancel-edit>${eventsTool.cancelEditButton[language]}</button>
        </div>
      </form>
    `
    : ''

  return `
    <section class="events-tool" data-events-tool>
      ${adminForm}
      <section class="events-list-panel">
        <div class="events-list-heading">
          <h2>${eventsTool.upcomingTitle[language]}</h2>
          <div class="events-list-actions">
            ${canAddEvents ? `<button type="button" data-event-admin-toggle data-show-label="${eventsTool.showAdminButton[language]}" data-hide-label="${eventsTool.hideAdminButton[language]}" aria-expanded="false" data-super-admin-events="${canSuperAdminEvents ? 'true' : 'false'}">${eventsTool.showAdminButton[language]}</button>` : ''}
            <button type="button" data-past-events-toggle>${eventsTool.pastButton[language]}</button>
          </div>
        </div>
        <div class="events-list" data-upcoming-events data-empty-label="${eventsTool.emptyUpcoming[language]}"></div>
        <div class="events-list is-hidden" data-past-events data-empty-label="${eventsTool.emptyPast[language]}" data-title="${eventsTool.pastTitle[language]}"></div>
      </section>
      <p class="score-status" data-events-status aria-live="polite">${eventsTool.loading[language]}</p>
      <div class="find-game-text-modal is-hidden" data-find-game-text-modal aria-hidden="true">
        <div class="find-game-text-dialog" role="dialog" aria-modal="true">
          <div class="find-game-text-dialog-content" data-find-game-text-modal-content></div>
        </div>
      </div>
    </section>
  `
}

function renderPointsTool(page, language, member) {
  const pointsTool = page.pointsTool
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(String(member?.membershipType || '').toUpperCase())

  if (isAdmin) {
    return `
      <section class="points-tool admin-member-report-tool" data-points-tool data-admin-points-report>
        <div class="admin-score-toolbar">
          <button type="button" data-admin-points-entry-toggle data-show-label="${pointsTool.adminShowPointsForm[language]}" data-hide-label="${pointsTool.adminHidePointsForm[language]}" aria-expanded="false">
            ${pointsTool.adminShowPointsForm[language]}
          </button>
        </div>
        <form class="score-entry-form admin-score-entry-form is-hidden" data-admin-points-entry-form>
          <h2>${pointsTool.adminFormTitle[language]}</h2>
          <div class="form-grid two-column">
            <label class="admin-score-junior-field">
              <span>${pointsTool.adminJuniorLabel[language]}</span>
              <select name="member_id" required data-admin-points-member>
                <option value="">${pointsTool.adminJuniorLoading[language]}</option>
              </select>
            </label>
            <label>
              <span>${pointsTool.adminPointsLabel[language]}</span>
              <input type="number" name="points" min="1" max="999" step="1" inputmode="numeric" required />
            </label>
            <label>
              <span>${pointsTool.adminDescriptionLabel[language]}</span>
              <input type="text" name="description" maxlength="160" required />
            </label>
            <div class="score-field">
              <span>${pointsTool.adminDateLabel[language]}</span>
              <div class="date-picker" data-date-picker>
                <input type="hidden" name="point_date" required data-date-input data-point-date />
                <button class="date-picker-button" type="button" data-date-picker-toggle aria-expanded="false">
                  <span data-date-picker-label></span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                  </svg>
                </button>
                <div class="date-picker-popover" data-date-picker-popover></div>
              </div>
            </div>
          </div>
          <input type="hidden" name="action" value="award_points" />
          <button type="submit">${pointsTool.adminSavePoints[language]}</button>
        </form>
        <div class="admin-report-toolbar" role="tablist" aria-label="${pointsTool.adminPathFilterLabel[language]}">
          <button type="button" class="active" data-admin-report-path="CUP">${pointsTool.cupButton[language]}</button>
          <button type="button" data-admin-report-path="COMMUNITY">${pointsTool.communityButton[language]}</button>
        </div>
        <div class="points-history-panel admin-report-panel">
          <div class="admin-report-heading">
            <h2>${pointsTool.adminTitle[language]}</h2>
            <span data-admin-points-count></span>
          </div>
          <div class="points-history-list admin-leaderboard-list" data-admin-points-list data-empty-label="${pointsTool.adminEmpty[language]}"></div>
        </div>
        <p class="score-status" data-points-status aria-live="polite">${pointsTool.loading[language]}</p>
      </section>
    `
  }

  return `
    <section class="points-tool" data-points-tool>
      <aside class="points-counter points-ledger-counter" aria-live="polite">
        <span>${pointsTool.pointsLabel[language]}</span>
        <strong data-points-balance>0</strong>
        <button type="button" data-cashout-toggle>${pointsTool.cashOutButton[language]}</button>
        <form class="cashout-form is-hidden" data-cashout-form>
          <input type="hidden" name="action" value="cash_out" />
          <label>
            <span>${pointsTool.cashOutLabel[language]}</span>
            <input type="number" name="points" min="1" step="1" inputmode="numeric" required data-cashout-points />
          </label>
          <button type="submit">${pointsTool.cashOutSubmit[language]}</button>
        </form>
        <p class="score-status" data-points-status aria-live="polite">${pointsTool.loading[language]}</p>
      </aside>
      <div class="points-history-panel">
        <h2>${pointsTool.historyTitle[language]}</h2>
        <div class="points-history-list" data-cashout-requests></div>
        <div class="points-history-list" data-points-list data-empty-label="${pointsTool.empty[language]}"></div>
      </div>
    </section>
  `
}

function renderScoreEntryFields(scoreTool, language, teeOptions, formatOptions) {
  return `
    <div class="score-field">
      <span>${scoreTool.dateLabel[language]}</span>
      <div class="date-picker" data-date-picker>
        <input type="hidden" name="round_date" required data-date-input data-round-date />
        <button class="date-picker-button" type="button" data-date-picker-toggle aria-expanded="false">
          <span data-date-picker-label></span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
          </svg>
        </button>
        <div class="date-picker-popover" data-date-picker-popover></div>
      </div>
    </div>
    <label>
      <span>${scoreTool.teeLabel[language]}</span>
      <select name="tee" required data-score-tee>
        ${teeOptions.map(([value, label]) => `<option value="${value}">${label[language]}</option>`).join('')}
      </select>
    </label>
    <label>
      <span>${scoreTool.formatLabel[language]}</span>
      <select name="format" required data-score-format>
        ${formatOptions.map(([value, label]) => `<option value="${value}">${label[language]}</option>`).join('')}
      </select>
    </label>
    <label data-score-field>
      <span data-score-label>${scoreTool.scoreLabel[language]}</span>
      <input type="text" name="score" maxlength="40" data-score-input />
    </label>
  `
}

function renderScoresTool(page, language, member) {
  const scoreTool = page.scoreTool
  const teeOptions = Object.entries(scoreTool.teeOptions)
  const formatOptions = Object.entries(scoreTool.formatOptions)
  const scoreEntryFields = renderScoreEntryFields(scoreTool, language, teeOptions, formatOptions)
  const isAdmin = member?.membershipType === 'SUPER_ADMIN'

  if (isAdmin) {
    return `
      <section class="scores-tool admin-member-report-tool" data-scores-tool data-admin-rounds-report>
        <div class="admin-score-toolbar">
          <button type="button" data-admin-score-toggle data-show-label="${scoreTool.adminShowScoreForm[language]}" data-hide-label="${scoreTool.adminHideScoreForm[language]}" aria-expanded="false">
            ${scoreTool.adminShowScoreForm[language]}
          </button>
        </div>
        <form class="score-entry-form admin-score-entry-form is-hidden" data-score-form data-admin-score-form>
          <h2>${scoreTool.formTitle[language]}</h2>
          <div class="form-grid two-column">
            <label class="admin-score-junior-field">
              <span>${scoreTool.adminJuniorLabel[language]}</span>
              <select name="member_id" required data-admin-score-member>
                <option value="">${scoreTool.adminJuniorLoading[language]}</option>
              </select>
            </label>
            ${scoreEntryFields}
          </div>
          <button type="submit">${scoreTool.button[language]}</button>
          <p class="score-status" data-score-status aria-live="polite">${scoreTool.loading[language]}</p>
        </form>
        <div class="admin-report-toolbar" role="tablist" aria-label="${scoreTool.adminPathFilterLabel[language]}">
          <button type="button" class="active" data-admin-report-path="CUP">${scoreTool.cupButton[language]}</button>
          <button type="button" data-admin-report-path="COMMUNITY">${scoreTool.communityButton[language]}</button>
        </div>
        <div class="admin-rounds-report-panel admin-report-panel" data-admin-rounds-list data-empty-label="${scoreTool.adminEmpty[language]}"></div>
      </section>
    `
  }

  return `
    <section class="scores-tool" data-scores-tool>
      <aside class="points-counter" aria-live="polite">
        <span>${scoreTool.pointsLabel[language]}</span>
        <strong data-points-count>0</strong>
        <small><span data-rounds-count>0</span> ${scoreTool.roundsLabel[language]}</small>
      </aside>
      <div class="score-entry-panel">
        <form class="score-entry-form" data-score-form>
          <h2>${scoreTool.formTitle[language]}</h2>
          <div class="form-grid two-column">
            ${scoreEntryFields}
          </div>
          <button type="submit">${scoreTool.button[language]}</button>
          <p class="score-status" data-score-status aria-live="polite">${scoreTool.loading[language]}</p>
        </form>
        <div class="round-list" data-round-list data-empty-label="${scoreTool.empty[language]}"></div>
      </div>
    </section>
  `
}

function renderHero(page, language) {
  return `
    <section class="hero hero-${page.id}" style="--hero-image: url('${page.image}'); --hero-position: ${page.heroPosition || 'center'}">
      <div class="hero-content">
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h1>${page.heading[language]}</h1>
        <p class="intro">${page.intro[language]}</p>
        ${
          page.hideHeroCta
            ? ''
            : `<a class="primary-action" href="#${page.ctaRoute}">${page.cta[language]}</a>`
        }
      </div>
    </section>
  `
}

function renderQuickPanel(page, language, copy) {
  return `
    <section class="quick-panel" aria-label="${page.title[language]} ${copy.quickLabel}">
      <div>
        <span>${copy.ageLabel}</span>
        <strong>${copy.ageValue}</strong>
      </div>
      <div>
        <span>${copy.formatLabel}</span>
        <strong>${copy.formatValue}</strong>
      </div>
      <div>
        <span>${copy.focusLabel}</span>
        <strong>${copy.focusValue}</strong>
      </div>
    </section>
  `
}

function renderFacebookLogo() {
  return `
    <svg class="facebook-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.018 10.125 11.927v-8.438H7.078v-3.49h3.047V9.414c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97H15.83c-1.491 0-1.955.931-1.955 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.091 24 18.099 24 12.073Z" />
    </svg>
  `
}

function renderNotice(page, language) {
  if (!page.notice) {
    return ''
  }

  const content = `
    <div class="notice-icon">
      ${page.notice.type === 'facebook' ? renderFacebookLogo() : ''}
    </div>
    <div>
      <h2>${page.notice.title[language]}</h2>
      <p>${page.notice.text[language]}</p>
    </div>
  `

  if (page.notice.url) {
    return `
      <a class="home-notice" href="${page.notice.url}" target="_blank" rel="noopener noreferrer" aria-label="${page.notice.title[language]}">
        ${content}
      </a>
    `
  }

  return `
    <section class="home-notice" aria-label="${page.notice.title[language]}">
      ${content}
    </section>
  `
}

function renderContentGrid(page, language) {
  const layoutClass = page.layout === 'two-column' ? 'content-grid two-column' : 'content-grid'

  return `
    <section class="${layoutClass}">
      ${page.sections
        .map(
          (section) => `
            <article>
              <h2>${section.title[language]}</h2>
              <p>${section.text[language]}</p>
              ${
                section.bullets
                  ? `<ul class="card-list">
                      ${section.bullets[language].map((item) => `<li>${item}</li>`).join('')}
                    </ul>`
                  : ''
              }
              ${
                section.link
                  ? `<a class="card-link" href="#${section.link.route}">${section.link.label[language]}</a>`
                  : ''
              }
              ${
                section.links
                  ? `<div class="card-actions">
                      ${section.links
                        .map((link) => {
                          const href = link.route ? `#${link.route}` : link.url
                          const attributes = link.route ? '' : ' target="_blank" rel="noopener"'

                          return `<a class="card-link" href="${href}"${attributes}>${link.label[language]}</a>`
                        })
                        .join('')}
                    </div>`
                  : ''
              }
            </article>
          `,
        )
        .join('')}
    </section>
  `
}

function renderServiceArea(copy) {
  return `
    <section class="service-area">
      <p class="eyebrow">${copy.areaEyebrow}</p>
      <h2>${copy.areaHeading}</h2>
      <p>${copy.areaText}</p>
    </section>
  `
}

function renderContactBand(copy) {
  return `
    <section class="contact-band">
      <div>
        <p class="eyebrow">${copy.contactEyebrow}</p>
        <h2>${copy.contactHeading}</h2>
      </div>
      <a class="secondary-action" href="#contact">${copy.contactButton}</a>
    </section>
  `
}

function renderFooter(language, isMemberPortal = false) {
  if (isMemberPortal) {
    return ''
  }

  const copy = {
    en: {
      privacyTitle: 'Privacy',
      privacyText: 'Hawkesbury Junior Golf collects and uses personal information only to operate the program, manage member accounts, communicate with parents and players, organize lessons, events, games, scores, and points, and meet safety or administrative needs. We do not sell personal information. Questions or privacy requests can be sent to info@hawkesburyjrgolf.ca.',
      disclaimerTitle: 'Disclaimer',
      disclaimerText: 'Program details, schedules, events, points, and availability may change. Participation in golf and related activities involves inherent risks, and parents or guardians are responsible for deciding whether activities are appropriate for their junior golfer. Website information is provided for general program purposes and is not legal, medical, financial, or professional advice.',
    },
    fr: {
      privacyTitle: 'Confidentialité',
      privacyText: 'Hawkesbury Junior Golf recueille et utilise les renseignements personnels seulement pour gérer le programme, les comptes membres, les communications avec les parents et les joueurs, les leçons, événements, parties, scores et points, ainsi que les besoins de sécurité ou d’administration. Nous ne vendons pas les renseignements personnels. Les questions ou demandes de confidentialité peuvent être envoyées à info@hawkesburyjrgolf.ca.',
      disclaimerTitle: 'Avis',
      disclaimerText: 'Les détails du programme, les horaires, les événements, les points et les disponibilités peuvent changer. La participation au golf et aux activités connexes comporte des risques inhérents, et les parents ou tuteurs sont responsables de décider si les activités conviennent à leur jeune golfeur. Les renseignements du site sont fournis à des fins générales du programme et ne constituent pas des conseils juridiques, médicaux, financiers ou professionnels.',
    },
  }[language]

  return `
    <footer class="site-footer">
      <details>
        <summary>${copy.privacyTitle}</summary>
        <p>${copy.privacyText}</p>
      </details>
      <details>
        <summary>${copy.disclaimerTitle}</summary>
        <p>${copy.disclaimerText}</p>
      </details>
    </footer>
  `
}

function renderLoginPanel(page, language) {
  const loginForm = page.loginForm
  const signupForm = page.signupForm
  const resendForm = page.resendForm
  const forgotForm = page.forgotForm
  const profileForm = page.profileForm
  const currentYear = new Date().getFullYear()
  const playerAgeLabel = profileForm.playerAgeLabel[language].replace('{year}', currentYear)

  return `
    <section class="login-panel" aria-label="${page.title[language]}">
      <div class="account-tabs" role="tablist" aria-label="${page.title[language]}">
        <button type="button" class="active" data-account-tab="login">${signupForm.loginTab[language]}</button>
        <button type="button" data-account-tab="join">${signupForm.joinTab[language]}</button>
        <button type="button" data-account-tab="resend">${signupForm.resendTab[language]}</button>
        <button type="button" data-account-tab="forgot">${signupForm.forgotTab[language]}</button>
        <button type="button" class="is-hidden" data-account-tab="profile">${signupForm.profileTab[language]}</button>
      </div>
      <form class="login-card is-hidden" data-account-form="join">
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h2>${signupForm.title[language]}</h2>
        <p class="login-notice">${signupForm.notice[language]}</p>
        <div class="join-entry-fields" data-join-fields>
          <div class="form-grid two-column">
            <label>
              <span>${signupForm.firstNameLabel[language]}</span>
              <input type="text" name="first_name" autocomplete="given-name" required />
            </label>
            <label>
              <span>${signupForm.lastNameLabel[language]}</span>
              <input type="text" name="last_name" autocomplete="family-name" required />
            </label>
          </div>
          <label>
            <span>${signupForm.parentEmailLabel[language]}</span>
            <input type="email" name="parent_email" autocomplete="email" required />
          </label>
          <label>
            <span>${signupForm.membershipTypeLabel[language]}</span>
            <span class="membership-toggle">
              <input type="radio" id="membership-cup" name="membership_type" value="CUP" checked />
              <label for="membership-cup">${signupForm.membershipOptions.cup[language]}</label>
              <input type="radio" id="membership-community" name="membership_type" value="COMMUNITY" />
              <label for="membership-community">${signupForm.membershipOptions.community[language]}</label>
            </span>
          </label>
          <div class="form-grid two-column">
            <label>
              <span>${signupForm.usernameLabel[language]}</span>
              <input type="text" name="username" autocomplete="username" required />
            </label>
            <label>
              <span>${signupForm.passwordLabel[language]}</span>
              <input type="password" name="password" autocomplete="new-password" required />
            </label>
          </div>
        </div>
        <button type="submit" data-default-label="${signupForm.button[language]}" data-created-label="${signupForm.createdButton[language]}">${signupForm.button[language]}</button>
        <p class="login-status" data-account-status aria-live="polite"></p>
        <button class="register-new-junior-button is-hidden" type="button" data-register-new-junior>${signupForm.registerNewJuniorButton[language]}</button>
        <p class="login-helper">${signupForm.helper[language]}</p>
      </form>
      <form class="login-card" data-account-form="login">
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h2>${loginForm.title[language]}</h2>
        <p class="login-notice">${loginForm.notice[language]}</p>
        <label>
          <span>${loginForm.usernameLabel[language]}</span>
          <input type="text" name="username" autocomplete="username" />
        </label>
        <label>
          <span>${loginForm.passwordLabel[language]}</span>
          <input type="password" name="password" autocomplete="current-password" />
        </label>
        <button type="submit">${loginForm.button[language]}</button>
        <p class="login-status" data-account-status aria-live="polite"></p>
        <p class="login-helper">${loginForm.helper[language]}</p>
        <p class="login-version">Version ${appVersion}</p>
      </form>
      <form class="login-card is-hidden" data-account-form="resend">
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h2>${resendForm.title[language]}</h2>
        <p class="login-notice">${resendForm.notice[language]}</p>
        <label>
          <span>${resendForm.parentEmailLabel[language]}</span>
          <input type="email" name="parent_email" autocomplete="email" required />
        </label>
        <button type="submit">${resendForm.button[language]}</button>
        <p class="login-status" data-account-status aria-live="polite"></p>
        <p class="login-helper">${resendForm.helper[language]}</p>
      </form>
      <form class="login-card is-hidden" data-account-form="forgot">
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h2>${forgotForm.title[language]}</h2>
        <p class="login-notice">${forgotForm.notice[language]}</p>
        <label>
          <span>${forgotForm.parentEmailLabel[language]}</span>
          <input type="email" name="parent_email" autocomplete="email" required />
        </label>
        <button type="submit">${forgotForm.button[language]}</button>
        <p class="login-status" data-account-status aria-live="polite"></p>
        <p class="login-helper">${forgotForm.helper[language]}</p>
      </form>
      <form class="login-card is-hidden" data-account-form="profile">
        <input type="hidden" name="profile_token" data-profile-token />
        <input type="hidden" name="profile_username" data-profile-username />
        <input type="hidden" name="profile_password" data-profile-password />
        <p class="eyebrow">${page.eyebrow[language]}</p>
        <h2>${profileForm.title[language]}</h2>
        <p class="login-notice">${profileForm.notice[language]}</p>
        <div class="form-grid two-column">
          <label>
            <span>${profileForm.parentNameLabel[language]}</span>
            <input type="text" name="parent_name" autocomplete="name" required />
          </label>
          <label>
            <span>${profileForm.parentTextLabel[language]}</span>
            <input type="tel" name="parent_text" autocomplete="tel" required />
          </label>
        </div>
        <label>
          <span>${playerAgeLabel}</span>
          <input type="number" name="player_age" min="1" max="18" inputmode="numeric" required data-player-age />
        </label>
        <label class="is-hidden" data-player-text-field>
          <span>${profileForm.playerTextLabel[language]}</span>
          <input type="tel" name="player_text" autocomplete="tel" />
        </label>
        <button type="submit">${profileForm.button[language]}</button>
        <p class="login-status" data-account-status aria-live="polite"></p>
        <p class="login-helper">${profileForm.helper[language]}</p>
      </form>
    </section>
  `
}

export function renderPage({ routes, page, language, copy, isLoggedIn, member, isMemberPortal = false }) {
  if (page.template === 'login') {
    return `
      ${renderHeader({ routes, page, language, copy, isLoggedIn, isMemberPortal })}
      <main>
        ${isMemberPortal ? '' : renderHero(page, language)}
        ${renderLoginPanel(page, language)}
      </main>
      ${renderFooter(language, isMemberPortal)}
    `
  }

  if (page.template === 'account') {
    return `
      ${renderHeader({ routes, page, language, copy, isLoggedIn, member, isMemberPortal })}
      <main>
        ${renderAccountPage(page, language, member, copy, isMemberPortal)}
      </main>
      ${renderFooter(language, isMemberPortal)}
    `
  }

  if (page.template === 'accountSubpage') {
    return `
      ${renderHeader({ routes, page, language, copy, isLoggedIn, member, isMemberPortal })}
      <main>
        ${renderAccountSubpage(page, language, member, isMemberPortal)}
      </main>
      ${renderFooter(language, isMemberPortal)}
    `
  }

  if (page.template === 'adminPanel') {
    return `
      ${renderHeader({ routes, page, language, copy, isLoggedIn, member, isMemberPortal })}
      <main>
        ${renderAdminPage(page, language, member)}
      </main>
      ${renderFooter(language, isMemberPortal)}
    `
  }

  return `
    ${renderHeader({ routes, page, language, copy, isLoggedIn, member, isMemberPortal })}
    <main>
      ${renderHero(page, language)}
      ${renderQuickPanel(page, language, copy)}
      ${renderNotice(page, language)}
      ${renderContentGrid(page, language)}
      ${renderServiceArea(copy)}
      ${renderContactBand(copy)}
    </main>
    ${renderFooter(language, isMemberPortal)}
  `
}
