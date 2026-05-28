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
        "en": "Practice Round",
        "fr": "Ronde de pratique"
      },
      "match-play": {
        "en": "Match Play",
        "fr": "Match Play"
      },
      "score": {
        "en": "Regular Round",
        "fr": "Ronde régulière"
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
    "regularScoreLabel": {
      "en": "Regular round score",
      "fr": "Score de ronde régulière"
    },
    "matchScoreLabel": {
      "en": "Match play result",
      "fr": "Résultat match play"
    },
    "stablefordScoreLabel": {
      "en": "Stableford score",
      "fr": "Score Stableford"
    },
    "button": {
      "en": "Save round",
      "fr": "Enregistrer la ronde"
    },
    "adminShowScoreForm": {
      "en": "Enter Score",
      "fr": "Entrer un score"
    },
    "adminHideScoreForm": {
      "en": "Hide Score",
      "fr": "Masquer le score"
    },
    "adminJuniorLabel": {
      "en": "Junior",
      "fr": "Junior"
    },
    "adminJuniorLoading": {
      "en": "Loading active juniors...",
      "fr": "Chargement des juniors actifs..."
    },
    "adminNoJuniors": {
      "en": "No active juniors available.",
      "fr": "Aucun junior actif disponible."
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
    },
    "adminPathFilterLabel": {
      "en": "Round report path",
      "fr": "Parcours du rapport des rondes"
    },
    "adminTitle": {
      "en": "Junior Rounds",
      "fr": "Rondes des juniors"
    },
    "cupButton": {
      "en": "Member",
      "fr": "Membre"
    },
    "communityButton": {
      "en": "Community",
      "fr": "Communauté"
    },
    "adminEmpty": {
      "en": "No juniors found for this group.",
      "fr": "Aucun junior trouvé pour ce groupe."
    },
    "expandRounds": {
      "en": "View rounds",
      "fr": "Voir les rondes"
    },
    "collapseRounds": {
      "en": "Hide rounds",
      "fr": "Masquer les rondes"
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
    "showAll": {
      "en": "View all point history",
      "fr": "Voir tout l’historique"
    },
    "showLatest": {
      "en": "Show latest 5",
      "fr": "Afficher les 5 derniers"
    },
    "loading": {
      "en": "Loading points...",
      "fr": "Chargement des points..."
    },
    "saving": {
      "en": "Saving cash out...",
      "fr": "Enregistrement de la demande..."
    },
    "adminSaving": {
      "en": "Saving points...",
      "fr": "Enregistrement des points..."
    },
    "adminShowPointsForm": {
      "en": "Enter Points",
      "fr": "Entrer des points"
    },
    "adminHidePointsForm": {
      "en": "Hide Points",
      "fr": "Masquer les points"
    },
    "adminFormTitle": {
      "en": "Enter Points",
      "fr": "Entrer des points"
    },
    "adminJuniorLabel": {
      "en": "Junior",
      "fr": "Junior"
    },
    "adminJuniorLoading": {
      "en": "Loading active juniors...",
      "fr": "Chargement des juniors actifs..."
    },
    "adminNoJuniors": {
      "en": "No active juniors available.",
      "fr": "Aucun junior actif disponible."
    },
    "adminPointsLabel": {
      "en": "Points",
      "fr": "Points"
    },
    "adminDescriptionLabel": {
      "en": "Reason",
      "fr": "Raison"
    },
    "adminDateLabel": {
      "en": "Date",
      "fr": "Date"
    },
    "adminSavePoints": {
      "en": "Save points",
      "fr": "Enregistrer les points"
    },
    "adminPathFilterLabel": {
      "en": "Points leaderboard path",
      "fr": "Parcours du classement des points"
    },
    "adminTitle": {
      "en": "Junior Points",
      "fr": "Points des juniors"
    },
    "cupButton": {
      "en": "Member",
      "fr": "Membre"
    },
    "communityButton": {
      "en": "Community",
      "fr": "Communauté"
    },
    "adminEmpty": {
      "en": "No juniors found for this group.",
      "fr": "Aucun junior trouvé pour ce groupe."
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
    "en": "Player rankings will activate once Ranking Point Rounds are created and ranking points are distributed. Rankings are for Member players only when they participate in eligible Ranking Point Rounds.",
    "fr": "Le classement des joueurs sera activé lorsque les rondes de points de classement seront créées et que les points de classement seront distribués. Le classement est réservé aux membres qui participent aux rondes admissibles de points de classement."
  },
  "rankingTool": {
    "tabsLabel": {
      "en": "Ranking views",
      "fr": "Vues du classement"
    },
    "pointsTab": {
      "en": "Points",
      "fr": "Points"
    },
    "roundsTab": {
      "en": "Rounds",
      "fr": "Rondes"
    },
    "scoresTab": {
      "en": "Scores",
      "fr": "Scores"
    },
    "travelTeamTab": {
      "en": "Travel Team Ranking",
      "fr": "Classement équipe de voyage"
    },
    "pointsTitle": {
      "en": "Points Ranking",
      "fr": "Classement par points"
    },
    "roundsTitle": {
      "en": "Most Rounds",
      "fr": "Plus de rondes"
    },
    "scoresTitle": {
      "en": "Scores Ranking",
      "fr": "Classement par scores"
    },
    "travelTeamTitle": {
      "en": "Travel Team Ranking",
      "fr": "Classement équipe de voyage"
    },
    "empty": {
      "en": "No Member rankings are visible yet.",
      "fr": "Aucun classement membre n’est visible pour le moment."
    },
    "loading": {
      "en": "Loading rankings...",
      "fr": "Chargement du classement..."
    },
    "loadError": {
      "en": "Unable to load rankings right now.",
      "fr": "Impossible de charger le classement pour le moment."
    },
    "cupOnly": {
      "en": "Member only - only players who choose Display Scores are shown.",
      "fr": "Membre seulement - seuls les joueurs qui choisissent Afficher les scores sont affichés."
    },
    "pointsLabel": {
      "en": "points",
      "fr": "points"
    },
    "roundsLabel": {
      "en": "rounds played",
      "fr": "rondes jouées"
    },
    "lowestScoreLabel": {
      "en": "Lowest score",
      "fr": "Meilleur score"
    },
    "noScore": {
      "en": "No score yet",
      "fr": "Aucun score"
    },
    "travelTeamPending": {
      "en": "Travel Team Ranking will display once we start tryouts and rounds for ranking.",
      "fr": "Le classement de l’équipe de voyage sera affiché lorsque les essais et les rondes de classement commenceront."
    },
    "recentRegularRounds": {
      "en": "Last 5 regular score rounds",
      "fr": "Les 5 dernières rondes régulières"
    },
    "noRegularRounds": {
      "en": "No regular score rounds yet.",
      "fr": "Aucune ronde régulière pour le moment."
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
        "en": "Member",
        "fr": "Membre"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Member and Community)",
        "fr": "Les deux (membre et communauté)"
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
    "notifyOthersLabel": {
      "en": "Text Others that you have added this Event?",
      "fr": "Texter les autres que vous avez ajouté cet événement?"
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
    "addPlayerButton": {
      "en": "Add Player to Event",
      "fr": "Ajouter un joueur à l’événement"
    },
    "hideAddPlayerButton": {
      "en": "Hide Add Player",
      "fr": "Masquer l’ajout de joueur"
    },
    "addPlayerLabel": {
      "en": "Player",
      "fr": "Joueur"
    },
    "addPlayerLoading": {
      "en": "Loading active juniors...",
      "fr": "Chargement des juniors actifs..."
    },
    "addPlayerEmpty": {
      "en": "No active juniors available.",
      "fr": "Aucun junior actif disponible."
    },
    "addPlayerSave": {
      "en": "Save",
      "fr": "Enregistrer"
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
    "editTitle": {
      "en": "Edit Round",
      "fr": "Modifier la ronde"
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
    "holesLabel": {
      "en": "Holes",
      "fr": "Trous"
    },
    "pathLabel": {
      "en": "Path",
      "fr": "Parcours"
    },
    "pathOptions": {
      "cup": {
        "en": "Member",
        "fr": "Membre"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Member and Community)",
        "fr": "Les deux (membre et communauté)"
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
    "notifyOthersLabel": {
      "en": "Text Others that you have added this Round?",
      "fr": "Texter les autres que vous avez ajouté cette ronde?"
    },
    "locationLabel": {
      "en": "Location",
      "fr": "Lieu"
    },
    "saveButton": {
      "en": "Post round",
      "fr": "Publier la ronde"
    },
    "updateButton": {
      "en": "Update round",
      "fr": "Mettre la ronde à jour"
    },
    "cancelEditButton": {
      "en": "Cancel edit",
      "fr": "Annuler la modification"
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
    "en": "Juniors can join available free volunteer-coach lesson times or request single and group lessons in the same My Account area used by Member and Community players. To book a lesson with Hawkesbury Golf and Curling Club professionals, contact the club directly; professional lessons are not free unless they are listed here in the Lessons area.",
    "fr": "Les juniors peuvent joindre les heures de leçon gratuites avec des entraîneurs bénévoles ou demander des leçons individuelles et de groupe dans le même espace Mon compte utilisé par les membres et les joueurs communautaires. Pour réserver une leçon avec les professionnels du Hawkesbury Golf and Curling Club, communiquez directement avec le club; les leçons professionnelles ne sont pas gratuites, sauf si elles sont affichées ici dans la section Leçons."
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
        "en": "Member",
        "fr": "Membre"
      },
      "community": {
        "en": "Community",
        "fr": "Communauté"
      },
      "everyone": {
        "en": "Both (Member and Community)",
        "fr": "Les deux (membre et communauté)"
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
    "notifyOthersLabel": {
      "en": "Text Others that you have added this Lesson?",
      "fr": "Texter les autres que vous avez ajouté cette leçon?"
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
