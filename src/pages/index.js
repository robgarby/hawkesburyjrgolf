import { homePage } from './HomePage.js'
import { lessonsPage } from './LessonsPage.js'
import { loginPage } from './LoginPage.js'
import { contactPage } from './ContactPage.js'
import { ourProgramPage } from './OurProgramPage.js'
import { sponsorsPage } from './SponsorsPage.js'
import { theCupPage } from './TheCupPage.js'
import { adminPanelPage, myAccountPage } from './MyAccountPage.js'
import {
  bookALessonPage,
  eventsPage,
  findAGamePage,
  pointsPage,
  rankingPage,
  scoresPage,
} from './AccountSubPages.js'

export const pages = [
  homePage,
  ourProgramPage,
  theCupPage,
  lessonsPage,
  sponsorsPage,
  contactPage,
  loginPage,
  myAccountPage,
  adminPanelPage,
  scoresPage,
  pointsPage,
  rankingPage,
  eventsPage,
  findAGamePage,
  bookALessonPage,
]

export const pageMap = new Map(pages.map((page) => [page.id, page]))
