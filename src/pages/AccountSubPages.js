const accountSubPageDefaults = {
  "template": "accountSubpage",
  "hideFromNav": true,
  "accountArea": true,
}

export const scoresPage = {
  ...accountSubPageDefaults,
  "id": "scores",
  "title": {
    "en": "Scores",
    "fr": "Scores"
  },
  "heading": {
    "en": "Scores",
    "fr": "Scores"
  },
  "intro": {
    "en": "Enter each round you play, including date, tee, format, and score. Every saved round earns 1 point toward rewards.",
    "fr": "Inscris chaque ronde que tu joues, incluant la date, le tee, le format et le score. Chaque ronde enregistrée donne 1 point pour les récompenses."
  },
  "scoreTool": {
    "pointsLabel": {
      "en": "Points",
      "fr": "Points"
    },
    "roundsLabel": {
      "en": "Rounds played",
      "fr": "Rondes jouées"
    },
    "formTitle": {
      "en": "Enter a score",
      "fr": "Inscrire un score"
    },
    "dateLabel": {
      "en": "Round date",
      "fr": "Date de la ronde"
    },
    "teeLabel": {
      "en": "Tee",
      "fr": "Tee"
    },
    "teeOptions": {
      "red": {
        "en": "Red",
        "fr": "Rouge"
      },
      "white": {
        "en": "White",
        "fr": "Blanc"
      },
      "blue": {
        "en": "Blue",
        "fr": "Bleu"
      },
      "black": {
        "en": "Black",
        "fr": "Noir"
      },
      "gold": {
        "en": "Gold",
        "fr": "Or"
      }
    },
    "formatLabel": {
      "en": "Format",
      "fr": "Format"
    },
    "formatOptions": {
      "practice": {
        "en": "Practice",
        "fr": "Pratique"
      },
      "1-2-3": {
        "en": "1-2-3",
        "fr": "1-2-3"
      },
      "match-play": {
        "en": "Match Play",
        "fr": "Match Play"
      },
      "score": {
        "en": "Score",
        "fr": "Score"
      },
      "stableford": {
        "en": "Stableford",
        "fr": "Stableford"
      }
    },
    "scoreLabel": {
      "en": "Score",
      "fr": "Score"
    },
    "button": {
      "en": "Save round",
      "fr": "Enregistrer la ronde"
    },
    "empty": {
      "en": "No rounds entered yet.",
      "fr": "Aucune ronde inscrite pour le moment."
    },
    "showAll": {
      "en": "Show all scores",
      "fr": "Afficher tous les scores"
    },
    "showLatest": {
      "en": "Show latest 5",
      "fr": "Afficher les 5 plus récents"
    },
    "loading": {
      "en": "Loading scores...",
      "fr": "Chargement des scores..."
    },
    "saveMessage": {
      "en": "Saving round...",
      "fr": "Enregistrement de la ronde..."
    }
  },
}

export const pointsPage = {
  ...accountSubPageDefaults,
  "id": "points",
  "title": {
    "en": "Points",
    "fr": "Points"
  },
  "heading": {
    "en": "Points",
    "fr": "Points"
  },
  "intro": {
    "en": "Track how points were earned from welcome rewards, rounds, events, and coach awards. Cash out requests are approved by an admin before points are spent at the Hawkesbury Golf Course Pro Shop.",
    "fr": "Suivez comment les points ont été gagnés par les récompenses de bienvenue, rondes, événements et prix des entraîneurs. Les demandes d’utilisation sont approuvées par un admin avant que les points soient dépensés à la boutique du pro du Hawkesbury Golf Course."
  },
  "pointsTool": {
    "pointsLabel": {
      "en": "Points",
      "fr": "Points"
    },
    "historyTitle": {
      "en": "Point history",
      "fr": "Historique des points"
    },
    "cashOutButton": {
      "en": "Cash Out",
      "fr": "Utiliser des points"
    },
    "cashOutLabel": {
      "en": "Points to spend",
      "fr": "Points à utiliser"
    },
    "cashOutSubmit": {
      "en": "Submit cash out",
      "fr": "Envoyer la demande"
    },
    "empty": {
      "en": "No points yet.",
      "fr": "Aucun point pour le moment."
    },
    "loading": {
      "en": "Loading points...",
      "fr": "Chargement des points..."
    },
    "saving": {
      "en": "Saving cash out...",
      "fr": "Enregistrement de la demande..."
    }
  },
}

export const rankingPage = {
  ...accountSubPageDefaults,
  "id": "ranking",
  "title": {
    "en": "Ranking",
    "fr": "Classement"
  },
  "heading": {
    "en": "Ranking",
    "fr": "Classement"
  },
  "intro": {
    "en": "Player rankings will activate once Ranking Point Rounds are created and ranking points are distributed. Rankings are for CUP members only when they participate in eligible Ranking Point Rounds.",
    "fr": "Le classement des joueurs sera activé lorsque les rondes de points de classement seront créées et que les points de classement seront distribués. Le classement est réservé aux membres CUP qui participent aux rondes admissibles de points de classement."
  },
}

export const eventsPage = {
  ...accountSubPageDefaults,
  "id": "events",
  "title": {
    "en": "Events",
    "fr": "Événements"
  },
  "heading": {
    "en": "Events",
    "fr": "Événements"
  },
  "intro": {
    "en": "View upcoming events, see who is attending, and join instantly when spots are open. Admins and teachers can add, edit, and remove events.",
    "fr": "Consultez les événements à venir, voyez qui participe et joignez instantanément lorsqu’il reste des places. Les admins et enseignants peuvent ajouter, modifier et supprimer les événements."
  },
  "eventsTool": {
    "addTitle": {
      "en": "Add Event",
      "fr": "Ajouter un événement"
    },
    "dateLabel": {
      "en": "Date",
      "fr": "Date"
    },
    "nameLabel": {
      "en": "Event Name",
      "fr": "Nom de l’événement"
    },
    "timeLabel": {
      "en": "Time",
      "fr": "Heure"
    },
    "winnerPointsLabel": {
      "en": "Points for Winner",
      "fr": "Points pour le gagnant"
    },
    "participantPointsLabel": {
      "en": "Points for Participant",
      "fr": "Points pour participant"
    },
    "maxPlayersLabel": {
      "en": "Maximum Players",
      "fr": "Nombre maximum de joueurs"
    },
    "pathLabel": {
      "en": "Path",
      "fr": "Parcours"
    },
    "pathOptions": {
      "cup": {
        "en": "CUP",
        "fr": "CUP"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Cup and Community)",
        "fr": "Les deux (CUP et communauté)"
      }
    },
    "communityCostLabel": {
      "en": "Cost for Community Member",
      "fr": "Coût pour membre communautaire"
    },
    "minAgeLabel": {
      "en": "Minimum age",
      "fr": "Âge minimum"
    },
    "maxAgeLabel": {
      "en": "Maximum age",
      "fr": "Âge maximum"
    },
    "noMinAgePlaceholder": {
      "en": "No minimum",
      "fr": "Aucun minimum"
    },
    "noMaxAgePlaceholder": {
      "en": "No maximum",
      "fr": "Aucun maximum"
    },
    "locationLabel": {
      "en": "Location",
      "fr": "Lieu"
    },
    "descriptionLabel": {
      "en": "Description",
      "fr": "Description"
    },
    "winnerLabel": {
      "en": "Winner",
      "fr": "Gagnant"
    },
    "attendeeCsvLabel": {
      "en": "Attendee CSV",
      "fr": "CSV des participants"
    },
    "attendeeCsvPlaceholder": {
      "en": "Junior Name, Parent Email, Notes",
      "fr": "Nom du junior, courriel du parent, notes"
    },
    "saveButton": {
      "en": "Save event",
      "fr": "Enregistrer l’événement"
    },
    "updateButton": {
      "en": "Update event",
      "fr": "Mettre à jour l’événement"
    },
    "editTitle": {
      "en": "Edit Event",
      "fr": "Modifier l’événement"
    },
    "editButton": {
      "en": "Edit",
      "fr": "Modifier"
    },
    "cancelEditButton": {
      "en": "Cancel edit",
      "fr": "Annuler la modification"
    },
    "hideAdminButton": {
      "en": "Close Add Event",
      "fr": "Fermer l’ajout d’événement"
    },
    "showAdminButton": {
      "en": "Add Event",
      "fr": "Ajouter un événement"
    },
    "upcomingTitle": {
      "en": "Upcoming events",
      "fr": "Événements à venir"
    },
    "pastButton": {
      "en": "View Past Events",
      "fr": "Voir les événements passés"
    },
    "hidePastButton": {
      "en": "Hide Past Events",
      "fr": "Masquer les événements passés"
    },
    "pastTitle": {
      "en": "Past events",
      "fr": "Événements passés"
    },
    "joinButton": {
      "en": "Join",
      "fr": "Participer"
    },
    "joinedButton": {
      "en": "Joined",
      "fr": "Inscrit"
    },
    "fullButton": {
      "en": "Full",
      "fr": "Complet"
    },
    "spotsOpen": {
      "en": "spots open",
      "fr": "places disponibles"
    },
    "attendingLabel": {
      "en": "Attending",
      "fr": "Participants"
    },
    "emptyUpcoming": {
      "en": "No upcoming events yet.",
      "fr": "Aucun événement à venir pour le moment."
    },
    "emptyPast": {
      "en": "No past events yet.",
      "fr": "Aucun événement passé pour le moment."
    },
    "loading": {
      "en": "Loading events...",
      "fr": "Chargement des événements..."
    },
    "saving": {
      "en": "Saving event...",
      "fr": "Enregistrement de l’événement..."
    }
  },
}

export const findAGamePage = {
  ...accountSubPageDefaults,
  "id": "find-a-game",
  "title": {
    "en": "Find a Round",
    "fr": "Trouver une ronde"
  },
  "heading": {
    "en": "Find a Round",
    "fr": "Trouver une ronde"
  },
  "intro": {
    "en": "Post a round you plan to play, show how many spots are open, and let any junior join the group.",
    "fr": "Publiez une ronde que vous prévoyez jouer, indiquez combien de places sont libres et permettez à tout junior de joindre le groupe."
  },
  "findGameTool": {
    "postButton": {
      "en": "Post a Round",
      "fr": "Publier une ronde"
    },
    "hidePostButton": {
      "en": "Hide Post Form",
      "fr": "Masquer le formulaire"
    },
    "formTitle": {
      "en": "Post a Round",
      "fr": "Publier une ronde"
    },
    "dateLabel": {
      "en": "Date",
      "fr": "Date"
    },
    "timeLabel": {
      "en": "Time",
      "fr": "Heure"
    },
    "spotsLabel": {
      "en": "Open spots",
      "fr": "Places disponibles"
    },
    "pathLabel": {
      "en": "Path",
      "fr": "Parcours"
    },
    "pathOptions": {
      "cup": {
        "en": "CUP",
        "fr": "CUP"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Cup and Community)",
        "fr": "Les deux (CUP et communauté)"
      }
    },
    "minAgeLabel": {
      "en": "Minimum age",
      "fr": "Âge minimum"
    },
    "maxAgeLabel": {
      "en": "Maximum age",
      "fr": "Âge maximum"
    },
    "noMinAgePlaceholder": {
      "en": "No minimum",
      "fr": "Aucun minimum"
    },
    "noMaxAgePlaceholder": {
      "en": "No maximum",
      "fr": "Aucun maximum"
    },
    "roundLabel": {
      "en": "Round you are playing",
      "fr": "Ronde que vous jouez"
    },
    "roundPlaceholder": {
      "en": "Example: 9 holes, front nine, walking",
      "fr": "Exemple : 9 trous, premier neuf, à pied"
    },
    "locationLabel": {
      "en": "Location",
      "fr": "Lieu"
    },
    "saveButton": {
      "en": "Post round",
      "fr": "Publier la ronde"
    },
    "gamesTitle": {
      "en": "Posted rounds",
      "fr": "Rondes publiées"
    },
    "empty": {
      "en": "No rounds posted yet.",
      "fr": "Aucune ronde publiée pour le moment."
    },
    "loading": {
      "en": "Loading rounds...",
      "fr": "Chargement des rondes..."
    },
    "saving": {
      "en": "Saving round...",
      "fr": "Enregistrement de la ronde..."
    }
  },
}

export const bookALessonPage = {
  ...accountSubPageDefaults,
  "id": "book-a-lesson",
  "title": {
    "en": "Book a Lesson",
    "fr": "Réserver une leçon"
  },
  "heading": {
    "en": "Book a Lesson",
    "fr": "Réserver une leçon"
  },
  "intro": {
    "en": "Juniors can join available free volunteer-coach lesson times or request single and group lessons in the same My Account area used by CUP and Community members. To book a lesson with Hawkesbury Golf and Curling Club professionals, contact the club directly; professional lessons are not free unless they are listed here in the Lessons area.",
    "fr": "Les juniors peuvent joindre les heures de leçon gratuites avec des entraîneurs bénévoles ou demander des leçons individuelles et de groupe dans le même espace Mon compte utilisé par les membres CUP et communautaires. Pour réserver une leçon avec les professionnels du Hawkesbury Golf and Curling Club, communiquez directement avec le club; les leçons professionnelles ne sont pas gratuites, sauf si elles sont affichées ici dans la section Leçons."
  },
  "lessonTool": {
    "availableButton": {
      "en": "Make Lesson Time Available",
      "fr": "Offrir une heure de leçon"
    },
    "requestButton": {
      "en": "Request a Lesson",
      "fr": "Demander une leçon"
    },
    "hideFormButton": {
      "en": "Hide Form",
      "fr": "Masquer le formulaire"
    },
    "availableTitle": {
      "en": "Make Lesson Time Available",
      "fr": "Offrir une heure de leçon"
    },
    "requestTitle": {
      "en": "Request a Lesson",
      "fr": "Demander une leçon"
    },
    "dateLabel": {
      "en": "Date",
      "fr": "Date"
    },
    "timeLabel": {
      "en": "Time",
      "fr": "Heure"
    },
    "typeLabel": {
      "en": "Type",
      "fr": "Type"
    },
    "singleOption": {
      "en": "Single",
      "fr": "Individuelle"
    },
    "groupOption": {
      "en": "Group",
      "fr": "Groupe"
    },
    "maxLabel": {
      "en": "Maximum number",
      "fr": "Nombre maximum"
    },
    "pathLabel": {
      "en": "Path",
      "fr": "Parcours"
    },
    "pathOptions": {
      "cup": {
        "en": "CUP",
        "fr": "CUP"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Cup and Community)",
        "fr": "Les deux (CUP et communauté)"
      }
    },
    "minAgeLabel": {
      "en": "Minimum age",
      "fr": "Âge minimum"
    },
    "maxAgeLabel": {
      "en": "Maximum age",
      "fr": "Âge maximum"
    },
    "noMinAgePlaceholder": {
      "en": "No minimum",
      "fr": "Aucun minimum"
    },
    "noMaxAgePlaceholder": {
      "en": "No maximum",
      "fr": "Aucun maximum"
    },
    "locationLabel": {
      "en": "Location",
      "fr": "Lieu"
    },
    "notesLabel": {
      "en": "Notes",
      "fr": "Notes"
    },
    "availableSave": {
      "en": "Save lesson time",
      "fr": "Enregistrer l’heure"
    },
    "requestSave": {
      "en": "Send request",
      "fr": "Envoyer la demande"
    },
    "availableListTitle": {
      "en": "Available lesson times",
      "fr": "Heures de leçon disponibles"
    },
    "requestListTitle": {
      "en": "Lesson requests",
      "fr": "Demandes de leçon"
    },
    "bookedListTitle": {
      "en": "Booked Lessons",
      "fr": "Leçons réservées"
    },
    "emptySlots": {
      "en": "No lesson times available yet.",
      "fr": "Aucune heure de leçon disponible pour le moment."
    },
    "emptyRequests": {
      "en": "No lesson requests yet.",
      "fr": "Aucune demande de leçon pour le moment."
    },
    "emptyBooked": {
      "en": "No booked lessons yet.",
      "fr": "Aucune leçon réservée pour le moment."
    },
    "loading": {
      "en": "Loading lessons...",
      "fr": "Chargement des leçons..."
    },
    "saving": {
      "en": "Saving lesson...",
      "fr": "Enregistrement de la leçon..."
    }
  },
}
