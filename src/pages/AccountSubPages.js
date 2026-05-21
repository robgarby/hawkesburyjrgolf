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
    "en": "View upcoming events, see who is attending, and join instantly when spots are open. Admins can add, edit, and remove events.",
    "fr": "Consultez les événements à venir, voyez qui participe et joignez instantanément lorsqu’il reste des places. Les admins peuvent ajouter, modifier et supprimer les événements."
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
        "en": "Everyone",
        "fr": "Tout le monde"
      }
    },
    "communityCostLabel": {
      "en": "Cost for Community Member",
      "fr": "Coût pour membre communautaire"
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
      "en": "Hide Admin",
      "fr": "Masquer admin"
    },
    "showAdminButton": {
      "en": "Show Admin",
      "fr": "Afficher admin"
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
    "en": "Find a Game",
    "fr": "Trouver une partie"
  },
  "heading": {
    "en": "Find a Game",
    "fr": "Trouver une partie"
  },
  "intro": {
    "en": "Post a round you plan to play, show how many spots are open, and let any junior join the group.",
    "fr": "Publiez une ronde que vous prévoyez jouer, indiquez combien de places sont libres et permettez à tout junior de joindre le groupe."
  },
  "findGameTool": {
    "postButton": {
      "en": "Post a Game",
      "fr": "Publier une partie"
    },
    "hidePostButton": {
      "en": "Hide Post Form",
      "fr": "Masquer le formulaire"
    },
    "formTitle": {
      "en": "Post a Game",
      "fr": "Publier une partie"
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
      "en": "Post game",
      "fr": "Publier la partie"
    },
    "gamesTitle": {
      "en": "Posted games",
      "fr": "Parties publiées"
    },
    "empty": {
      "en": "No games posted yet.",
      "fr": "Aucune partie publiée pour le moment."
    },
    "loading": {
      "en": "Loading games...",
      "fr": "Chargement des parties..."
    },
    "saving": {
      "en": "Saving game...",
      "fr": "Enregistrement de la partie..."
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
    "en": "Juniors can join available lesson times or request single and group lessons. Admins and teachers can offer lesson times and accept requests.",
    "fr": "Les juniors peuvent joindre les heures de leçon disponibles ou demander des leçons individuelles et de groupe. Les admins et enseignants peuvent offrir des heures de leçon et accepter les demandes."
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
