export interface paths {
    "/api/v1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Hello
         * @description Récupération des données pour
         */
        get: operations["AppController_getHello_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login
         * @description Exécution de login
         */
        post: operations["AuthController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh
         * @description Exécution de refresh
         */
        post: operations["AuthController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Exécution de logout
         */
        post: operations["AuthController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Me
         * @description Récupération des données pour me
         */
        get: operations["AuthController_me_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/utilisateurs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister Utilisateurs
         * @description Récupération des données pour utilisateurs
         */
        get: operations["AdminController_listerUtilisateurs_v1"];
        put?: never;
        /**
         * Creer Utilisateur
         * @description Exécution de utilisateurs
         */
        post: operations["AdminController_creerUtilisateur_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/utilisateurs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Utilisateur
         * @description Récupération des données pour utilisateurs/:id
         */
        get: operations["AdminController_detailUtilisateur_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Utilisateur
         * @description Mise à jour partielle de utilisateurs/:id
         */
        patch: operations["AdminController_majUtilisateur_v1"];
        trace?: never;
    };
    "/api/v1/admin/utilisateurs/{id}/connexions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Connexions
         * @description Récupération des données pour utilisateurs/:id/connexions
         */
        get: operations["AdminController_connexions_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/utilisateurs/{id}/desactiver": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Desactiver
         * @description Exécution de utilisateurs/:id/desactiver
         */
        post: operations["AdminController_desactiver_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/utilisateurs/{id}/reinitialiser-mot-de-passe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reinitialiser Mot De Passe
         * @description Exécution de utilisateurs/:id/reinitialiser-mot-de-passe
         */
        post: operations["AdminController_reinitialiserMotDePasse_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister Roles
         * @description Récupération des données pour roles
         */
        get: operations["AdminController_listerRoles_v1"];
        put?: never;
        /**
         * Creer Role
         * @description Exécution de roles
         */
        post: operations["AdminController_creerRole_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Supprimer Role
         * @description Suppression de roles/:id
         */
        delete: operations["AdminController_supprimerRole_v1"];
        options?: never;
        head?: never;
        /**
         * Maj Role
         * @description Mise à jour partielle de roles/:id
         */
        patch: operations["AdminController_majRole_v1"];
        trace?: never;
    };
    "/api/v1/admin/roles/{id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister Permissions Role
         * @description Récupération des données pour roles/:id/permissions
         */
        get: operations["AdminController_listerPermissionsRole_v1"];
        /**
         * Maj Permissions Role
         * @description Mise à jour de roles/:id/permissions
         */
        put: operations["AdminController_majPermissionsRole_v1"];
        /**
         * Ajouter Permission Role
         * @description Exécution de roles/:id/permissions
         */
        post: operations["AdminController_ajouterPermissionRole_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister Permissions
         * @description Récupération des données pour permissions
         */
        get: operations["AdminController_listerPermissions_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/core/parametres": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour parametres
         */
        get: operations["CoreController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de parametres
         */
        post: operations["CoreController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/core/parametres/{cle}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Trouver
         * @description Récupération des données pour parametres/:cle
         */
        get: operations["CoreController_trouver_v1"];
        /**
         * Maj
         * @description Mise à jour de parametres/:cle
         */
        put: operations["CoreController_maj_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/client/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Rechercher
         * @description Récupération des données pour clients
         */
        get: operations["ClientController_rechercher_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de clients
         */
        post: operations["ClientController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/client/clients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour clients/:id
         */
        get: operations["ClientController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj
         * @description Mise à jour partielle de clients/:id
         */
        patch: operations["ClientController_maj_v1"];
        trace?: never;
    };
    "/api/v1/client/clients/{id}/contacts-urgence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ajouter Contact
         * @description Exécution de clients/:id/contacts-urgence
         */
        post: operations["ClientController_ajouterContact_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/client/clients/{id}/pieces-identite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ajouter Piece
         * @description Exécution de clients/:id/pieces-identite
         */
        post: operations["ClientController_ajouterPiece_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/client/clients/{id}/pieces-identite/{idPiece}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Piece
         * @description Mise à jour partielle de clients/:id/pieces-identite/:idPiece
         */
        patch: operations["ClientController_majPiece_v1"];
        trace?: never;
    };
    "/api/v1/residence/contrats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour contrats
         */
        get: operations["ResidenceController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de contrats
         */
        post: operations["ResidenceController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/clients/{id}/devenir-resident": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Devenir Resident
         * @description Exécution de clients/:id/devenir-resident
         */
        post: operations["ResidenceController_devenirResident_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour contrats/:id
         */
        get: operations["ResidenceController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pdf Contrat
         * @description Contrat de location en PDF pour contrats/:id
         */
        get: operations["ResidenceController_pdfContrat_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/etat-des-lieux": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Etat Des Lieux
         * @description Récupération des données pour contrats/:id/etat-des-lieux
         */
        get: operations["ResidenceController_etatDesLieux_v1"];
        put?: never;
        /**
         * Ajouter Photo Etat Des Lieux
         * @description Exécution de contrats/:id/etat-des-lieux
         */
        post: operations["ResidenceController_ajouterPhotoEtatDesLieux_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/etat-des-lieux/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Supprimer Photo Etat Des Lieux
         * @description Suppression de etat-des-lieux/:id
         */
        delete: operations["ResidenceController_supprimerPhotoEtatDesLieux_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/caution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Caution
         * @description Récupération des données pour contrats/:id/caution
         */
        get: operations["ResidenceController_caution_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/caution/restitution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restituer Caution
         * @description Exécution de contrats/:id/caution/restitution
         */
        post: operations["ResidenceController_restituerCaution_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/activer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Activer
         * @description Exécution de contrats/:id/activer
         */
        post: operations["ResidenceController_activer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats/{id}/reviser-loyer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reviser
         * @description Exécution de contrats/:id/reviser-loyer
         */
        post: operations["ResidenceController_reviser_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/echeances/{id}/encaisser": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Encaisser
         * @description Exécution de echeances/:id/encaisser
         */
        post: operations["ResidenceController_encaisser_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/echeances/{id}/recu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Recu Echeance
         * @description Reçu PDF de l’échéance — bilan montant dû/payé/reste
         */
        get: operations["ResidenceController_recuEcheance_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/suivi": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Suivi
         * @description Récupération des données pour suivi
         */
        get: operations["ResidenceController_suivi_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/impayes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Impayes
         * @description Récupération des données pour impayes
         */
        get: operations["ResidenceController_impayes_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/occupation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Occupation
         * @description Récupération des données pour occupation
         */
        get: operations["ResidenceController_occupation_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/batiments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour batiments
         */
        get: operations["BatimentsController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de batiments
         */
        post: operations["BatimentsController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/batiments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Supprimer
         * @description Suppression de batiments/:id
         */
        delete: operations["BatimentsController_supprimer_v1"];
        options?: never;
        head?: never;
        /**
         * Maj
         * @description Mise à jour partielle de batiments/:id
         */
        patch: operations["BatimentsController_maj_v1"];
        trace?: never;
    };
    "/api/v1/residence/logements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour logements
         */
        get: operations["LogementsController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de logements
         */
        post: operations["LogementsController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/logements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour logements/:id
         */
        get: operations["LogementsController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj
         * @description Mise à jour partielle de logements/:id
         */
        patch: operations["LogementsController_maj_v1"];
        trace?: never;
    };
    "/api/v1/residence/sejours": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour sejours
         */
        get: operations["SejoursController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de sejours
         */
        post: operations["SejoursController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/sejours/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour sejours/:id
         */
        get: operations["SejoursController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj
         * @description Mise à jour partielle de sejours/:id
         */
        patch: operations["SejoursController_maj_v1"];
        trace?: never;
    };
    "/api/v1/residence/sejours/{id}/payer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Payer
         * @description Exécution de sejours/:id/payer
         */
        post: operations["SejoursController_payer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/categories-charges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Categories
         * @description Récupération des données pour categories-charges
         */
        get: operations["ChargesController_categories_v1"];
        put?: never;
        /**
         * Creer Categorie
         * @description Exécution de categories-charges
         */
        post: operations["ChargesController_creerCategorie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/categories-charges/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Categorie
         * @description Mise à jour partielle de categories-charges/:id
         */
        patch: operations["ChargesController_majCategorie_v1"];
        trace?: never;
    };
    "/api/v1/residence/charges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour charges
         */
        get: operations["ChargesController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de charges
         */
        post: operations["ChargesController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/charges/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour charges/:id
         */
        get: operations["ChargesController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/charges/{id}/payer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Payer
         * @description Exécution de charges/:id/payer
         */
        post: operations["ChargesController_payer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/abonnements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour abonnements
         */
        get: operations["AbonnementsController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de abonnements
         */
        post: operations["AbonnementsController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/abonnements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj
         * @description Mise à jour partielle de abonnements/:id
         */
        patch: operations["AbonnementsController_maj_v1"];
        trace?: never;
    };
    "/api/v1/residence/abonnements/{id}/resilier": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resilier
         * @description Exécution de abonnements/:id/resilier
         */
        post: operations["AbonnementsController_resilier_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resume
         * @description Récupération des données pour resume
         */
        get: operations["PortailController_resume_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/echeances": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Echeances
         * @description Récupération des données pour echeances
         */
        get: operations["PortailController_echeances_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/etat-des-lieux": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Etat Des Lieux
         * @description Récupération des données pour etat-des-lieux
         */
        get: operations["PortailController_etatDesLieux_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/paiements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Paiements
         * @description Récupération des données pour paiements
         */
        get: operations["PortailController_paiements_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/caution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Caution
         * @description Récupération des données pour caution
         */
        get: operations["PortailController_caution_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/echeances/{id}/recu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Recu Echeance
         * @description Récupération des données pour echeances/:id/recu
         */
        get: operations["PortailController_recuEcheance_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/portail/paiements/{id}/recu": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Recu Paiement
         * @description Récupération des données pour paiements/:id/recu
         */
        get: operations["PortailController_recuPaiement_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facturation/prestations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Prestations
         * @description Récupération des données pour prestations
         */
        get: operations["FacturationController_prestations_v1"];
        put?: never;
        /**
         * Creer Prestation
         * @description Exécution de prestations
         */
        post: operations["FacturationController_creerPrestation_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facturation/prestations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Prestation
         * @description Mise à jour partielle de prestations/:id
         */
        patch: operations["FacturationController_majPrestation_v1"];
        trace?: never;
    };
    "/api/v1/facturation/prestations/{id}/facturer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Facturer
         * @description Exécution de prestations/:id/facturer
         */
        post: operations["FacturationController_facturer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facturation/factures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Factures
         * @description Récupération des données pour factures
         */
        get: operations["FacturationController_factures_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facturation/factures/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Facture
         * @description Récupération des données pour factures/:id
         */
        get: operations["FacturationController_detailFacture_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Modifier Facture
         * @description Édition du libellé de factures/:id
         */
        patch: operations["FacturationController_majFacture_v1"];
        trace?: never;
    };
    "/api/v1/facturation/factures/{id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pdf Facture
         * @description Récupération des données pour factures/:id/pdf
         */
        get: operations["FacturationController_pdfFacture_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facturation/factures/{id}/ticket": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ticket Facture
         * @description Ticket de caisse 58/80mm pour factures/:id
         */
        get: operations["FacturationController_ticketFacture_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/consolidation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consolidation
         * @description Récupération des données pour consolidation
         */
        get: operations["FinancesController_consolidation_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/tableau-de-bord": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tableau De Bord
         * @description Récupération des données pour tableau-de-bord
         */
        get: operations["FinancesController_tableauDeBord_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/activites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Activites
         * @description Récupération des données pour activites
         */
        get: operations["FinancesController_activites_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/paiements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Paiements
         * @description Récupération des données pour paiements
         */
        get: operations["FinancesController_paiements_v1"];
        put?: never;
        /**
         * Creer Paiement
         * @description Exécution de paiements
         */
        post: operations["FinancesController_creerPaiement_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/paiements-par-utilisateur": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Paiements Par Utilisateur
         * @description Encaissements/décaissements agrégés par employé sur une période (ex. la journée) — combien chaque employé a rapporté, plus le total en sommant les lignes. `id_caisse` permet à un admin de filtrer sur une caisse précise.
         */
        get: operations["FinancesController_paiementsParUtilisateur_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/paiements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Paiement
         * @description Mise à jour partielle de paiements/:id
         */
        patch: operations["FinancesController_majPaiement_v1"];
        trace?: never;
    };
    "/api/v1/finances/depenses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Depenses
         * @description Récupération des données pour depenses
         */
        get: operations["FinancesController_depenses_v1"];
        put?: never;
        /**
         * Creer Depense
         * @description Exécution de depenses
         */
        post: operations["FinancesController_creerDepense_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/depenses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Supprimer Depense
         * @description Suppression de depenses/:id
         */
        delete: operations["FinancesController_supprimerDepense_v1"];
        options?: never;
        head?: never;
        /**
         * Maj Depense
         * @description Mise à jour partielle de depenses/:id
         */
        patch: operations["FinancesController_majDepense_v1"];
        trace?: never;
    };
    "/api/v1/finances/categories-depenses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Categories Depenses
         * @description Récupération des données pour categories-depenses
         */
        get: operations["FinancesController_categoriesDepenses_v1"];
        put?: never;
        /**
         * Creer Categorie Depense
         * @description Exécution de categories-depenses
         */
        post: operations["FinancesController_creerCategorieDepense_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/categories-depenses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Supprimer Categorie Depense
         * @description Suppression de categories-depenses/:id
         */
        delete: operations["FinancesController_supprimerCategorieDepense_v1"];
        options?: never;
        head?: never;
        /**
         * Maj Categorie Depense
         * @description Mise à jour partielle de categories-depenses/:id
         */
        patch: operations["FinancesController_majCategorieDepense_v1"];
        trace?: never;
    };
    "/api/v1/finances/categories-depenses/{id}/hint": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Hint Categorie Depense
         * @description Dernière dépense de categories-depenses/:id (montant/libellé)
         */
        get: operations["FinancesController_hintCategorieDepense_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/impayes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Impayes
         * @description Récupération des données pour impayes
         */
        get: operations["FinancesController_impayes_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/moyens-paiement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Moyens Paiement
         * @description Récupération des données pour moyens-paiement
         */
        get: operations["FinancesController_moyensPaiement_v1"];
        put?: never;
        /**
         * Creer Moyen Paiement
         * @description Exécution de moyens-paiement
         */
        post: operations["FinancesController_creerMoyenPaiement_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/moyens-paiement/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Moyen Paiement
         * @description Mise à jour partielle de moyens-paiement/:id
         */
        patch: operations["FinancesController_majMoyenPaiement_v1"];
        trace?: never;
    };
    "/api/v1/finances/caisses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Caisses
         * @description Liste des caisses — un utilisateur assigné à une caisse ne voit que la sienne
         */
        get: operations["FinancesController_caisses_v1"];
        put?: never;
        /**
         * Creer Caisse
         * @description Création d’une caisse
         */
        post: operations["FinancesController_creerCaisse_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/caisses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Caisse
         * @description Mise à jour partielle de caisses/:id
         */
        patch: operations["FinancesController_majCaisse_v1"];
        trace?: never;
    };
    "/api/v1/finances/caisses/{id}/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Dashboard Caisse
         * @description Tableau de bord d’une caisse (revenus du jour, totaux, employés et détails des paiements)
         */
        get: operations["FinancesController_dashboardCaisse_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/finances/tirages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tirages
         * @description Historique des tirages de caisse — un utilisateur assigné à une caisse ne voit que les siens
         */
        get: operations["FinancesController_tirages_v1"];
        put?: never;
        /**
         * Creer Tirage
         * @description Tirage (fermeture) de caisse — montant compté vs attendu, écart calculé, un par caisse et par jour
         */
        post: operations["FinancesController_creerTirage_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/categories-produits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Categories
         * @description Récupération des données pour categories-produits
         */
        get: operations["MarketController_categories_v1"];
        put?: never;
        /**
         * Creer Categorie
         * @description Exécution de categories-produits
         */
        post: operations["MarketController_creerCategorie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/categories-produits/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Desactiver Categorie
         * @description Suppression de categories-produits/:id
         */
        delete: operations["MarketController_desactiverCategorie_v1"];
        options?: never;
        head?: never;
        /**
         * Maj Categorie
         * @description Mise à jour partielle de categories-produits/:id
         */
        patch: operations["MarketController_majCategorie_v1"];
        trace?: never;
    };
    "/api/v1/market/fournisseurs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Fournisseurs
         * @description Récupération des données pour fournisseurs
         */
        get: operations["MarketController_fournisseurs_v1"];
        put?: never;
        /**
         * Creer Fournisseur
         * @description Exécution de fournisseurs
         */
        post: operations["MarketController_creerFournisseur_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/fournisseurs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Desactiver Fournisseur
         * @description Suppression de fournisseurs/:id
         */
        delete: operations["MarketController_desactiverFournisseur_v1"];
        options?: never;
        head?: never;
        /**
         * Maj Fournisseur
         * @description Mise à jour partielle de fournisseurs/:id
         */
        patch: operations["MarketController_majFournisseur_v1"];
        trace?: never;
    };
    "/api/v1/market/produits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Produits
         * @description Récupération des données pour produits
         */
        get: operations["MarketController_produits_v1"];
        put?: never;
        /**
         * Creer Produit
         * @description Exécution de produits
         */
        post: operations["MarketController_creerProduit_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/produits/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Produit
         * @description Récupération des données pour produits/:id
         */
        get: operations["MarketController_detailProduit_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Produit
         * @description Mise à jour partielle de produits/:id
         */
        patch: operations["MarketController_majProduit_v1"];
        trace?: never;
    };
    "/api/v1/market/ventes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ventes
         * @description Récupération des données pour ventes
         */
        get: operations["MarketController_ventes_v1"];
        put?: never;
        /**
         * Creer Vente
         * @description Exécution de ventes
         */
        post: operations["MarketController_creerVente_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/rapports/ventes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Rapport Ventes
         * @description Récupération des données pour rapports/ventes
         */
        get: operations["MarketController_rapportVentes_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/ventes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Vente
         * @description Récupération des données pour ventes/:id
         */
        get: operations["MarketController_detailVente_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/ventes/{id}/annuler": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler Vente
         * @description Exécution de ventes/:id/annuler
         */
        post: operations["MarketController_annulerVente_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/mouvements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ajouter Mouvement
         * @description Exécution de mouvements
         */
        post: operations["MarketController_ajouterMouvement_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/stock/alerte": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stock Alerte
         * @description Récupération des données pour stock/alerte
         */
        get: operations["MarketController_stockAlerte_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/stock/historique": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stock Historique
         * @description Récupération des données pour stock/historique
         */
        get: operations["MarketController_stockHistorique_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/stock/reesolde": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reesolde
         * @description Exécution de stock/reesolde
         */
        post: operations["MarketController_reesolde_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Categories
         * @description Récupération des données pour categories
         */
        get: operations["RestaurantController_categories_v1"];
        put?: never;
        /**
         * Creer Categorie
         * @description Exécution de categories
         */
        post: operations["RestaurantController_creerCategorie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/plats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Plats
         * @description Récupération des données pour plats
         */
        get: operations["RestaurantController_plats_v1"];
        put?: never;
        /**
         * Creer Plat
         * @description Exécution de plats
         */
        post: operations["RestaurantController_creerPlat_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/plats/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Plat
         * @description Récupération des données pour plats/:id
         */
        get: operations["RestaurantController_detailPlat_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Plat
         * @description Mise à jour partielle de plats/:id
         */
        patch: operations["RestaurantController_majPlat_v1"];
        trace?: never;
    };
    "/api/v1/restaurant/plats/{id}/image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Maj Image Plat
         * @description Exécution de plats/:id/image
         */
        post: operations["RestaurantController_majImagePlat_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/commandes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Commandes
         * @description Récupération des données pour commandes
         */
        get: operations["RestaurantController_commandes_v1"];
        put?: never;
        /**
         * Creer Commande
         * @description Exécution de commandes
         */
        post: operations["RestaurantController_creerCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/commandes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Commande
         * @description Récupération des données pour commandes/:id
         */
        get: operations["RestaurantController_detailCommande_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/commandes/{id}/statut": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Maj Statut Commande
         * @description Exécution de commandes/:id/statut
         */
        post: operations["RestaurantController_majStatutCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/commandes/{id}/annuler": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler Commande
         * @description Exécution de commandes/:id/annuler
         */
        post: operations["RestaurantController_annulerCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/restaurant/rapports/ventes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Rapport Ventes
         * @description Récupération des données pour rapports/ventes
         */
        get: operations["RestaurantController_rapportVentes_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Telecharger
         * @description Récupération des données pour
         */
        get: operations["UploadsController_telecharger_v1"];
        put?: never;
        /**
         * Upload
         * @description Exécution de
         */
        post: operations["UploadsController_upload_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pressing/commandes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Commandes
         * @description Récupération des données pour commandes
         */
        get: operations["PressingController_commandes_v1"];
        put?: never;
        /**
         * Creer Commande
         * @description Exécution de commandes
         */
        post: operations["PressingController_creerCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pressing/commandes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Commande
         * @description Récupération des données pour commandes/:id
         */
        get: operations["PressingController_detailCommande_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Commande
         * @description Mise à jour partielle de commandes/:id
         */
        patch: operations["PressingController_majCommande_v1"];
        trace?: never;
    };
    "/api/v1/pressing/commandes/{id}/traitement": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Passage Traitement
         * @description Exécution de commandes/:id/traitement
         */
        post: operations["PressingController_passageTraitement_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pressing/commandes/{id}/pret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Passage Pret
         * @description Exécution de commandes/:id/pret
         */
        post: operations["PressingController_passagePret_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pressing/commandes/{id}/retirer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retirer Commande
         * @description Exécution de commandes/:id/retirer
         */
        post: operations["PressingController_retirerCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/pressing/commandes/{id}/annuler": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler Commande
         * @description Exécution de commandes/:id/annuler
         */
        post: operations["PressingController_annulerCommande_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salle-fete/reservations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reservations
         * @description Récupération des données pour reservations
         */
        get: operations["SalleFeteController_reservations_v1"];
        put?: never;
        /**
         * Creer Reservation
         * @description Exécution de reservations
         */
        post: operations["SalleFeteController_creerReservation_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salle-fete/reservations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Reservation
         * @description Récupération des données pour reservations/:id
         */
        get: operations["SalleFeteController_detailReservation_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Reservation
         * @description Mise à jour partielle de reservations/:id
         */
        patch: operations["SalleFeteController_majReservation_v1"];
        trace?: never;
    };
    "/api/v1/salle-fete/disponibilites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Disponibilites
         * @description Récupération des données pour disponibilites
         */
        get: operations["SalleFeteController_disponibilites_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salle-fete/reservations/{id}/confirmer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirmer Reservation
         * @description Exécution de reservations/:id/confirmer
         */
        post: operations["SalleFeteController_confirmerReservation_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salle-fete/reservations/{id}/realiser": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Realiser Reservation
         * @description Exécution de reservations/:id/realiser
         */
        post: operations["SalleFeteController_realiserReservation_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salle-fete/reservations/{id}/annuler": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler Reservation
         * @description Exécution de reservations/:id/annuler
         */
        post: operations["SalleFeteController_annulerReservation_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Services
         * @description Récupération des données pour services
         */
        get: operations["RhController_services_v1"];
        put?: never;
        /**
         * Creer Service
         * @description Exécution de services
         */
        post: operations["RhController_creerService_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/services/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Service
         * @description Mise à jour partielle de services/:id
         */
        patch: operations["RhController_majService_v1"];
        trace?: never;
    };
    "/api/v1/rh/employes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Employes
         * @description Récupération des données pour employes
         */
        get: operations["RhController_employes_v1"];
        put?: never;
        /**
         * Creer Employe
         * @description Exécution de employes
         */
        post: operations["RhController_creerEmploye_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/employes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Employe
         * @description Récupération des données pour employes/:id
         */
        get: operations["RhController_detailEmploye_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Employe
         * @description Mise à jour partielle de employes/:id
         */
        patch: operations["RhController_majEmploye_v1"];
        trace?: never;
    };
    "/api/v1/rh/pointages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pointages
         * @description Récupération des données pour pointages
         */
        get: operations["RhController_pointages_v1"];
        put?: never;
        /**
         * Pointer Arrivee
         * @description Exécution de pointages
         */
        post: operations["RhController_pointerArrivee_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/pointages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Pointage
         * @description Récupération des données pour pointages/:id
         */
        get: operations["RhController_detailPointage_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Maj Pointage
         * @description Mise à jour partielle de pointages/:id
         */
        patch: operations["RhController_majPointage_v1"];
        trace?: never;
    };
    "/api/v1/rh/pointages/{id}/depart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pointer Depart
         * @description Exécution de pointages/:id/depart
         */
        post: operations["RhController_pointerDepart_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Paies
         * @description Récupération des données pour paies
         */
        get: operations["RhController_paies_v1"];
        put?: never;
        /**
         * Creer Paie
         * @description Exécution de paies
         */
        post: operations["RhController_creerPaie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail Paie
         * @description Récupération des données pour paies/:id
         */
        get: operations["RhController_detailPaie_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/pdf": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pdf Bulletin
         * @description Récupération des données pour paies/:id/pdf
         */
        get: operations["RhController_pdfBulletin_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/elements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ajouter Element
         * @description Exécution de paies/:id/elements
         */
        post: operations["RhController_ajouterElement_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/recalculer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recalculer Paie
         * @description Exécution de paies/:id/recalculer
         */
        post: operations["RhController_recalculerPaie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/valider": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Valider Paie
         * @description Mise à jour partielle de paies/:id/valider
         */
        patch: operations["RhController_validerPaie_v1"];
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/annuler": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Annuler Paie
         * @description Exécution de paies/:id/annuler
         */
        post: operations["RhController_annulerPaie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rh/paies/{id}/payer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Payer Paie
         * @description Exécution de paies/:id/payer
         */
        post: operations["RhController_payerPaie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rapports/synthese-globale": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Synthese Globale
         * @description Récupération des données pour synthese-globale
         */
        get: operations["RapportsController_syntheseGlobale_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rapports/financier": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Financier
         * @description Récupération des données pour financier
         */
        get: operations["RapportsController_financier_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rapports/activites/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Activites
         * @description Récupération des données pour activites/:code
         */
        get: operations["RapportsController_activites_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rapports/rh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Rh
         * @description Récupération des données pour rh
         */
        get: operations["RapportsController_rh_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rapports/series": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Series
         * @description Récupération des données pour series
         */
        get: operations["RapportsController_series_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Dashboard
         * @description Récupération des données pour
         */
        get: operations["DashboardController_dashboard_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/dashboard/tableau-de-bord": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tableau De Bord
         * @description Récupération des données pour tableau-de-bord
         */
        get: operations["DashboardController_tableauDeBord_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/journal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Journal
         * @description Récupération des données pour journal
         */
        get: operations["AuditController_journal_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/audit/masquer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Masquer
         * @description Exécution de masquer
         */
        post: operations["AuditController_masquer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/signalements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour signalements
         */
        get: operations["SignalementController_lister_v1"];
        put?: never;
        /**
         * Creer
         * @description Exécution de signalements
         */
        post: operations["SignalementController_creer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/signalements/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detail
         * @description Récupération des données pour signalements/:id
         */
        get: operations["SignalementController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/signalements/{id}/prendre-en-charge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Prendre En Charge
         * @description Exécution de signalements/:id/prendre-en-charge
         */
        post: operations["SignalementController_prendreEnCharge_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/signalements/{id}/resoudre": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resoudre
         * @description Exécution de signalements/:id/resoudre
         */
        post: operations["SignalementController_resoudre_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/signalements/{id}/rejeter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rejeter
         * @description Exécution de signalements/:id/rejeter
         */
        post: operations["SignalementController_rejeter_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/sauvegardes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lister
         * @description Récupération des données pour
         */
        get: operations["SauvegardesController_lister_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/sauvegardes/declencher": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Declencher
         * @description Exécution de declencher
         */
        post: operations["SauvegardesController_declencher_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/sauvegardes/{id}/restaurer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restaurer
         * @description Exécution de :id/restaurer
         */
        post: operations["SauvegardesController_restaurer_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/sauvegardes/planification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Planification
         * @description Récupération des données pour planification
         */
        get: operations["SauvegardesController_getPlanification_v1"];
        /**
         * Maj Planification
         * @description Mise à jour de planification
         */
        put: operations["SauvegardesController_majPlanification_v1"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Live
         * @description Récupération des données pour live
         */
        get: operations["HealthController_live_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ready
         * @description Récupération des données pour ready
         */
        get: operations["HealthController_ready_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Aggregate
         * @description Récupération des données pour
         */
        get: operations["HealthController_aggregate_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs/generer-echeances": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generer Echeances
         * @description Exécution de generer-echeances
         */
        post: operations["JobsController_genererEcheances_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs/reesolde-stock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reesolde Stock
         * @description Exécution de reesolde-stock
         */
        post: operations["JobsController_reesoldeStock_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs/recalculer-paie": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recalculer Paie
         * @description Exécution de recalculer-paie
         */
        post: operations["JobsController_recalculerPaie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/jobs/transition-contrats-expires": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transition Contrats Expires
         * @description Exécution de transition-contrats-expires
         */
        post: operations["JobsController_transitionnerContratsExpires_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Scrape
         * @description Récupération des données pour
         */
        get: operations["MetricsController_scrape"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        LoginDto: {
            /** @example admin */
            login: string;
            /**
             * @description Mot de passe de démonstration des seeds.
             * @example motdepasse
             */
            mot_de_passe: string;
        };
        RefreshTokenDto: {
            /** @description Jeton de rafraîchissement brut (32 octets aléatoires encodés). */
            refresh_token: string;
        };
        LogoutDto: {
            /** @description Jeton de rafraîchissement à révoquer. */
            refresh_token: string;
        };
        CreerUtilisateurDto: {
            /** @example KOUASSI */
            nom?: Record<string, never> | null;
            /** @example Aya */
            prenom?: Record<string, never> | null;
            /** @example aya.kouassi */
            login: string;
            /** @example MotDePasse8! */
            mot_de_passe: string;
            /** @example 3 */
            id_role: string;
            /** @example 2 */
            id_activite_scope?: Record<string, never> | null;
            /** @example 1 */
            id_caisse?: Record<string, never> | null;
            /** @example 5 */
            id_employe?: Record<string, never> | null;
            /** @example 12 */
            id_client?: Record<string, never> | null;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajUtilisateurDto: {
            nom?: Record<string, never> | null;
            prenom?: Record<string, never> | null;
            login?: string;
            id_role?: string;
            id_activite_scope?: Record<string, never> | null;
            id_caisse?: Record<string, never> | null;
            id_employe?: Record<string, never> | null;
            id_client?: Record<string, never> | null;
            /** @enum {boolean} */
            actif?: true | false;
        };
        ReinitialiserMotDePasseDto: {
            /** @example MotDePasse8! */
            nouveau_mot_de_passe: string;
        };
        CreerRoleDto: {
            /** @example RESPONSABLE_MAGASIN */
            code: string;
            /** @example Responsable magasin */
            libelle: string;
            description?: Record<string, never> | null;
        };
        MajRoleDto: {
            /** @example RESPONSABLE_MAGASIN */
            code?: string;
            /** @example Responsable magasin */
            libelle?: string;
            description?: Record<string, never> | null;
        };
        MajPermissionsRoleDto: {
            /**
             * @description Identifiants des permissions — le jeu complet remplace l’existant (tableau vide = tout décocher)
             * @example [
             *       "42",
             *       "43"
             *     ]
             */
            id_permissions: string[];
        };
        AjouterPermissionRoleDto: {
            /** @example 42 */
            id_permission: string;
        };
        CreerParametreDto: {
            /** @example DEVISE_DEFAUT */
            cle: string;
            /** @example FCFA */
            valeur: string;
            description?: Record<string, never> | null;
        };
        MajParametreDto: {
            /** @example XOF */
            valeur: string;
            description?: Record<string, never> | null;
        };
        CreerClientDto: {
            /** @example KOUASSI */
            nom: string;
            /** @example Aya */
            prenoms: string;
            /** @example +2250700000000 */
            tel_principal: string;
            /** @enum {string} */
            type_client: "LOCATAIRE" | "PASSAGE" | "AUTRE";
            date_naissance?: Record<string, never> | null;
            lieu_naissance?: Record<string, never> | null;
            sexe?: Record<string, never> | null;
            nationalite?: Record<string, never> | null;
            profession?: Record<string, never> | null;
            photo?: Record<string, never> | null;
            tel_secondaire?: Record<string, never> | null;
            email?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
            ville?: Record<string, never> | null;
            pays?: Record<string, never> | null;
        };
        MajClientDto: {
            nom?: string;
            prenoms?: string;
            tel_principal?: string;
            /** @enum {string} */
            type_client?: "LOCATAIRE" | "PASSAGE" | "AUTRE";
            date_naissance?: Record<string, never> | null;
            lieu_naissance?: Record<string, never> | null;
            sexe?: Record<string, never> | null;
            nationalite?: Record<string, never> | null;
            profession?: Record<string, never> | null;
            photo?: Record<string, never> | null;
            tel_secondaire?: Record<string, never> | null;
            email?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
            ville?: Record<string, never> | null;
            pays?: Record<string, never> | null;
        };
        CreerContactDto: {
            /** @example Mme N'Guessan */
            nom: string;
            prenom?: Record<string, never> | null;
            /** @example MERE */
            lien: string;
            /** @example +2250700000000 */
            tel_principal: string;
            tel_secondaire?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
            email?: Record<string, never> | null;
        };
        CreerPieceDto: {
            /** @enum {string} */
            type_piece: "CNI" | "PASSEPORT" | "CARTE_SEJOUR" | "AUTRE";
            /** @example C-2026-000001 */
            numero: string;
            date_delivrance?: Record<string, never> | null;
            date_expiration?: Record<string, never> | null;
            autorite_delivrance?: Record<string, never> | null;
            /** @description Clé objet S3/MinIO du scan RECTO (§31). */
            copie_num?: Record<string, never> | null;
            /** @description Clé objet S3/MinIO du scan VERSO (§31, optionnel — un passeport n’a pas de verso). */
            copie_num_verso?: Record<string, never> | null;
        };
        MajPieceDto: {
            date_delivrance?: Record<string, never> | null;
            date_expiration?: Record<string, never> | null;
            autorite_delivrance?: Record<string, never> | null;
            /** @description Clé objet S3/MinIO du scan RECTO (§31). */
            copie_num?: Record<string, never> | null;
            /** @description Clé objet S3/MinIO du scan VERSO (§31, optionnel — un passeport n’a pas de verso). */
            copie_num_verso?: Record<string, never> | null;
        };
        CreerContratDto: {
            /** @description Id du client (bigint, transporté en string). */
            id_client: string;
            /** @description Id du logement (bigint, transporté en string). */
            id_logement: string;
            /** @example 2026-01-01 */
            date_debut: string;
            /** @example 95000 */
            montant_loyer: string;
            /** @enum {string} */
            type_location: "MENSUEL" | "ANNUEL";
            /** @enum {string} */
            statut?: "EN_ATTENTE" | "ACTIF" | "EXPIRE" | "RESILIE" | "TERMINE";
            date_fin_prevue?: Record<string, never> | null;
            duree_mois?: Record<string, never> | null;
            periodicite?: Record<string, never> | null;
            date_signature?: Record<string, never> | null;
        };
        DevenirResidentDto: {
            /** @description Id du logement (bigint, transporté en string). */
            id_logement: string;
            /** @example 2026-01-01 */
            date_debut: string;
            /** @example 95000 */
            montant_loyer: string;
            /** @enum {string} */
            type_location: "MENSUEL" | "ANNUEL";
            date_fin_prevue?: Record<string, never> | null;
            duree_mois?: Record<string, never> | null;
            periodicite?: Record<string, never> | null;
            date_signature?: Record<string, never> | null;
        };
        AjouterPhotoEtatLieuxDto: {
            /** @enum {string} */
            type: "ENTREE" | "SORTIE";
            /**
             * @description Pièce/zone photographiée — libre, non contrôlé.
             * @example Chambre
             */
            piece?: Record<string, never> | null;
            /** @description Clé objet S3/MinIO renvoyée par POST /uploads (catégorie etat-lieux). */
            cle_objet: string;
            commentaire?: Record<string, never> | null;
        };
        RestituerCautionDto: {
            /**
             * @description Montant retenu sur la caution (déduit du montant restitué).
             * @example 25000
             */
            retenue?: Record<string, never> | null;
            /** @example Peinture à refaire */
            motif_retenue?: Record<string, never> | null;
        };
        ReviserLoyerDto: {
            /** @example 100000 */
            nouveau_montant: string;
            date_effet?: string;
            motif?: string;
        };
        EncaisserLoyerDto: {
            /** @example 95000 */
            montant: string;
            /** @description Id du moyen de paiement (bigint, string). */
            id_moyen: string;
            date?: string;
        };
        CreerBatimentDto: {
            /** @example D */
            code: string;
            /** @example Résidence D */
            nom: string;
            /** @example Cocody Riviera 3 */
            adresse?: Record<string, never> | null;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajBatimentDto: {
            code?: string;
            nom?: string;
            adresse?: Record<string, never> | null;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerLogementDto: {
            /** @example Chambre 104 */
            nom?: Record<string, never> | null;
            /** @enum {string} */
            type: "CHAMBRE" | "STUDIO" | "APPARTEMENT" | "MEUBLE";
            /** @example 35000 */
            tarif: string;
            equipements?: Record<string, never> | null;
            /** @enum {string} */
            statut: "DISPONIBLE" | "RESERVE" | "OCCUPE" | "EN_NETTOYAGE" | "EN_MAINTENANCE" | "INDISPONIBLE";
            etat?: Record<string, never> | null;
            /**
             * @description Bâtiment d’appartenance.
             * @example 1
             */
            id_batiment: string;
        };
        MajLogementDto: {
            nom?: Record<string, never> | null;
            /** @enum {string} */
            type?: "CHAMBRE" | "STUDIO" | "APPARTEMENT" | "MEUBLE";
            tarif?: string;
            equipements?: Record<string, never> | null;
            /** @enum {string} */
            statut?: "DISPONIBLE" | "RESERVE" | "OCCUPE" | "EN_NETTOYAGE" | "EN_MAINTENANCE" | "INDISPONIBLE";
            etat?: Record<string, never> | null;
            id_batiment?: string;
        };
        NouveauClientSejourDto: {
            /** @example DIABATE */
            nom: string;
            /** @example Seydou */
            prenoms: string;
            /** @example +2250700000000 */
            tel_principal: string;
            /**
             * @default PASSAGE
             * @enum {string}
             */
            type_client: "LOCATAIRE" | "PASSAGE" | "AUTRE";
        };
        PaiementSejourDto: {
            /** @example 35000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerSejourDto: {
            /** @enum {string} */
            type_prestation: "NUITEE" | "SIESTE";
            /** @example 3 */
            id_client?: Record<string, never> | null;
            client?: components["schemas"]["NouveauClientSejourDto"];
            /** @example 2 */
            id_logement: string;
            /** @example 2026-08-20 20:00:00 */
            date_heure_arrivee: string;
            /** @example 2026-08-21 12:00:00 */
            date_heure_depart_prevue?: Record<string, never> | null;
            /** @example 1 nuit */
            duree?: string;
            /** @example 35000.00 */
            tarif: string;
            /** @example 35000.00 */
            montant_total?: string;
            paiement?: components["schemas"]["PaiementSejourDto"];
            /**
             * @default EN_COURS
             * @enum {string}
             */
            statut: "EN_COURS" | "TERMINE" | "ANNULE";
        };
        MajSejourDto: {
            /** @enum {string} */
            type_prestation?: "NUITEE" | "SIESTE";
            id_logement?: string;
            date_heure_arrivee?: string;
            date_heure_depart_prevue?: Record<string, never> | null;
            date_heure_depart_reelle?: Record<string, never> | null;
            duree?: Record<string, never> | null;
            tarif?: string;
            id_moyen_paiement?: Record<string, never> | null;
            /** @enum {string} */
            statut?: "EN_COURS" | "TERMINE" | "ANNULE";
        };
        PayerSejourDto: {
            /** @example 35000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerCategorieChargeDto: {
            /** @example Électricité */
            libelle: string;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajCategorieChargeDto: {
            libelle?: string;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerChargeDto: {
            /** @example 2 */
            id_logement: string;
            /** @example 1 */
            id_categorie_charge: string;
            /** @example 2026-08 */
            periode: string;
            /** @example CPT-301 */
            compteur_numero?: Record<string, never> | null;
            /** @example 120.5 */
            lecture_debut?: Record<string, never> | null;
            /** @example 165.2 */
            lecture_fin?: Record<string, never> | null;
            /** @example 44.7 */
            consommation?: Record<string, never> | null;
            /** @example 25000.00 */
            montant: string;
        };
        PayerChargeDto: {
            /** @example 25000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerAbonnementDto: {
            /** @example 3 */
            id_client: string;
            /** @example 5 */
            id_logement?: Record<string, never> | null;
            /** @example Internet fibre */
            service: string;
            /** @enum {string} */
            type: "MENSUEL" | "ANNUEL" | "PERIODIQUE";
            /** @example 20000.00 */
            montant: string;
            /** @example 2026-08-01 */
            date_debut: string;
            date_fin?: Record<string, never> | null;
            montant_paye?: string;
            /**
             * @default ACTIF
             * @enum {string}
             */
            statut: "ACTIF" | "SUSPENDU" | "RESILIE" | "EXPIRE";
        };
        MajAbonnementDto: {
            id_client?: string;
            id_logement?: Record<string, never> | null;
            service?: string;
            /** @enum {string} */
            type?: "MENSUEL" | "ANNUEL" | "PERIODIQUE";
            montant?: string;
            date_debut?: string;
            date_fin?: Record<string, never> | null;
            montant_paye?: Record<string, never> | null;
            /** @enum {string} */
            statut?: "ACTIF" | "SUSPENDU" | "RESILIE" | "EXPIRE";
        };
        PortailClientDto: {
            /** @example 12 */
            id_client: string;
            /** @example KOUASSI */
            nom: string;
            /** @example Yao Emmanuel */
            prenoms: string;
        };
        PortailLogementDto: {
            /** @example CH-103 */
            numero: string;
            /** @example Chambre 103 */
            nom: Record<string, never> | null;
            /** @example RES */
            batiment: Record<string, never> | null;
        };
        PortailContratDto: {
            /** @example 42 */
            id_contrat: string;
            /** @example CON-2026-042 */
            numero_contrat: string;
            /** @example 2026-01-01 */
            date_debut: string;
            /** @example 2027-01-01 */
            date_fin_prevue: Record<string, never> | null;
            /** @example 150000.00 */
            montant_loyer: string;
            /** @example MENSUEL */
            periodicite: Record<string, never> | null;
            logement: components["schemas"]["PortailLogementDto"];
        };
        ProchaineEcheanceDto: {
            /** @example 8 */
            mois: number;
            /** @example 2026 */
            annee: number;
            /** @example 150000.00 */
            montant: string;
            /** @enum {string} */
            statut: "PAYE" | "IMPAYE" | "PARTIEL" | "A_VENIR";
        };
        PortailResumeDto: {
            client: components["schemas"]["PortailClientDto"];
            contrat_en_cours: components["schemas"]["PortailContratDto"] | null;
            prochaine_echeance: components["schemas"]["ProchaineEcheanceDto"] | null;
            /** @example 150000.00 */
            total_impayes: string;
        };
        PortailEcheanceDto: {
            /** @example 501 */
            id_echeance: string;
            /** @example 8 */
            mois: number;
            /** @example 2026 */
            annee: number;
            /** @example 150000.00 */
            montant: string;
            /** @enum {string} */
            statut: "PAYE" | "IMPAYE" | "PARTIEL" | "A_VENIR";
            /** @example 2026-08-01 */
            date_echeance: Record<string, never> | null;
            /** @example 2026-08-05T10:00:00.000Z */
            date_paiement: Record<string, never> | null;
            /** @example 150000.00 */
            montant_paye: Record<string, never> | null;
            /** @example CON-2026-042 */
            numero_contrat: string;
        };
        PortailEcheancesDto: {
            echeances: components["schemas"]["PortailEcheanceDto"][];
            prochaine_echeance: components["schemas"]["ProchaineEcheanceDto"] | null;
            /** @example 0.00 */
            total_impayes: string;
        };
        PortailPaiementDto: {
            /** @example 900 */
            id_paiement: string;
            /** @example 2026-08-05T10:00:00.000Z */
            date: string;
            /** @example 150000.00 */
            montant: string;
            /** @enum {string} */
            type: "LOYER" | "CHARGE" | "AUTRE";
            /** @example Espèces */
            mode_paiement: string;
            /** @example LOYER-CON-2026-042-8-2026 */
            reference: Record<string, never> | null;
        };
        PortailPaiementsDto: {
            paiements: components["schemas"]["PortailPaiementDto"][];
        };
        PortailCautionDto: {
            /** @example 9 */
            id_caution: string;
            /** @example 150000.00 */
            montant: string;
            /** @example 2026-01-01 */
            date_versement: Record<string, never> | null;
            /** @enum {string|null} */
            statut: "EN_COURS" | "RESTITUEE" | "RETENUE" | null;
            /** @example 150000.00 */
            montant_restitue: Record<string, never> | null;
            /** @example 0.00 */
            retenue: Record<string, never> | null;
            /** @example Dégradations constatées */
            motif_retenue: Record<string, never> | null;
        };
        PortailHistoriqueCautionDto: {
            /** @example VERSEMENT */
            evenement: string;
            /** @example 2026-01-01T10:00:00.000Z */
            date: string;
            /** @example 150000.00 */
            montant: Record<string, never> | null;
            /** @example Dépôt initial */
            motif: Record<string, never> | null;
        };
        PortailCautionResponseDto: {
            caution: components["schemas"]["PortailCautionDto"] | null;
            historique: components["schemas"]["PortailHistoriqueCautionDto"][];
        };
        RecuEcheanceLigneDto: {
            /** @example 8 */
            mois: number;
            /** @example 2026 */
            annee: number;
            /** @example 150000.00 */
            montant: string;
            /** @example 2026-08-01 */
            date_echeance: Record<string, never> | null;
            /** @enum {string} */
            statut: "PAYE" | "IMPAYE" | "PARTIEL" | "A_VENIR";
            /** @example CON-2026-042 */
            numero_contrat: string;
        };
        RecuClientDto: {
            /** @example KOUASSI */
            nom: Record<string, never> | null;
            /** @example Yao Emmanuel */
            prenoms: Record<string, never> | null;
        };
        RecuEcheanceDto: {
            /** @enum {string} */
            type: "LOYER";
            /** @example LOYER-CON-2026-042-8-2026 */
            reference: string;
            /** @example 2026-08-05T10:00:00.000Z */
            date: Record<string, never> | null;
            /** @example 150000.00 */
            montant: string;
            /** @example Espèces */
            mode_paiement: Record<string, never> | null;
            echeance: components["schemas"]["RecuEcheanceLigneDto"];
            client: components["schemas"]["RecuClientDto"];
            /** @example CH-103 */
            logement: Record<string, never> | null;
        };
        RecuPaiementEcheanceDto: {
            /** @example 8 */
            mois: number;
            /** @example 2026 */
            annee: number;
            /** @example CON-2026-042 */
            numero_contrat: string;
        };
        RecuLigneFactureDto: {
            /** @example Électricité août 2026 */
            libelle: string;
            /** @example 1 */
            quantite: string;
            /** @example 15000.00 */
            prix_unitaire: string;
            /** @example 15000.00 */
            total: string;
        };
        RecuFactureDto: {
            /** @example FAC-2026-0005 */
            numero: string;
            /** @example 2026-08-05T10:00:00.000Z */
            date: Record<string, never> | null;
            /** @example 15000.00 */
            montant_total: string;
            /** @example 15000.00 */
            montant_paye: string;
            lignes: components["schemas"]["RecuLigneFactureDto"][];
        };
        RecuPaiementDto: {
            /** @enum {string} */
            type: "LOYER" | "CHARGE" | "AUTRE";
            /** @example FAC-2026-0005 */
            reference: string;
            /** @example 2026-08-05T10:00:00.000Z */
            date: string;
            /** @example 150000.00 */
            montant: string;
            /** @example Espèces */
            mode_paiement: string;
            /** @description Échéance visée — présent pour un loyer. */
            echeance: components["schemas"]["RecuPaiementEcheanceDto"];
            /** @description Facture sous-jacente — présent pour une charge/autre. */
            facture: components["schemas"]["RecuFactureDto"];
            client: components["schemas"]["RecuClientDto"];
        };
        CreerPrestationDto: {
            /** @example Prestation de ménage */
            libelle: string;
            categorie?: Record<string, never> | null;
            /** @example 15000.00 */
            prix: string;
            description?: Record<string, never> | null;
            /** @example 7 */
            id_activite?: Record<string, never> | null;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajPrestationDto: {
            libelle?: string;
            categorie?: Record<string, never> | null;
            prix?: string;
            description?: Record<string, never> | null;
            id_activite?: Record<string, never> | null;
            /** @enum {boolean} */
            actif?: true | false;
        };
        NouveauClientFacturationDto: {
            /** @example KOUASSI */
            nom: string;
            /** @example Aya */
            prenoms: string;
            /** @example +2250700000000 */
            tel_principal: string;
            /**
             * @default PASSAGE
             * @enum {string}
             */
            type_client: "LOCATAIRE" | "PASSAGE" | "AUTRE";
        };
        LigneFacturationDto: {
            /** @example Ménage complet */
            libelle: string;
            /** @default 1 */
            quantite: number;
            /** @example 15000.00 */
            prix_unitaire: string;
        };
        FacturerPrestationDto: {
            /** @example 15000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
            /** @example 3 */
            id_client?: Record<string, never> | null;
            client?: components["schemas"]["NouveauClientFacturationDto"];
            lignes?: components["schemas"]["LigneFacturationDto"][];
            /** @example 2000.00 */
            remise?: Record<string, never> | null;
        };
        MajFactureDto: {
            libelle?: Record<string, never> | null;
        };
        CreerPaiementDto: {
            /** @example 25000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
            /** @example 2 */
            id_activite?: string;
            /**
             * @description Caisse ayant saisi ce paiement. Ignoré pour un utilisateur assigné à une caisse — le service force sa propre caisse.
             * @example 1
             */
            id_caisse?: string;
            /** @example 2026-08-15 */
            date?: string;
            motif?: string;
            reference?: string;
            /** @example 12 */
            id_facture?: string;
        };
        MajPaiementDto: {
            /** @example 2026-08-15 */
            date?: string;
            /** @example 1 */
            id_moyen?: string;
            motif?: Record<string, never> | null;
            reference?: Record<string, never> | null;
        };
        CreerDepenseDto: {
            /** @example 2026-08-15 */
            date?: string;
            /** @example 25000.00 */
            montant: string;
            /** @example 1 */
            id_categorie_depense: string;
            /** @example 2 */
            id_activite?: Record<string, never> | null;
            /**
             * @description Caisse ayant saisi cette dépense. Ignoré pour un utilisateur assigné à une caisse — le service force sa propre caisse.
             * @example 1
             */
            id_caisse?: Record<string, never> | null;
            /** @example Fournitures de bureau */
            libelle: string;
            justificatif?: Record<string, never> | null;
        };
        MajDepenseDto: {
            /** @example 2026-08-15 */
            date?: string;
            /** @example 25000.00 */
            montant?: string;
            /** @example 1 */
            id_categorie_depense?: string;
            /** @example 2 */
            id_activite?: Record<string, never> | null;
            /** @example Fournitures de bureau */
            libelle?: string;
            justificatif?: Record<string, never> | null;
        };
        CreerCategorieDepenseDto: {
            /** @example Fournitures de bureau */
            libelle: string;
        };
        MajCategorieDepenseDto: {
            /** @example Fournitures de bureau */
            libelle?: string;
        };
        CreerMoyenPaiementDto: {
            /** @example Mobile Money */
            libelle: string;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajMoyenPaiementDto: {
            /** @example Mobile Money */
            libelle?: string;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerCaisseDto: {
            /** @example Caisse 1 — Restaurant */
            libelle: string;
            /** @example 2 */
            id_activite: string;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajCaisseDto: {
            /** @example Caisse 1 — Restaurant */
            libelle?: string;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerTirageDto: {
            /** @example 125000.00 */
            montant_compte: string;
            /** @example 2026-08-24 */
            date?: string;
            /**
             * @description Caisse à tirer. Requis pour un utilisateur non scopé ; doit correspondre à la caisse assignée sinon.
             * @example 1
             */
            id_caisse?: string;
            note?: string;
        };
        CreerCategorieProduitDto: {
            /** @example Boissons */
            libelle: string;
        };
        MajCategorieProduitDto: {
            libelle?: string;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerFournisseurDto: {
            /** @example SODEXCO */
            nom: string;
            contact?: Record<string, never> | null;
            telephone?: Record<string, never> | null;
            email?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
        };
        MajFournisseurDto: {
            nom?: string;
            contact?: Record<string, never> | null;
            telephone?: Record<string, never> | null;
            email?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
            /** @enum {boolean} */
            actif?: true | false;
        };
        CreerProduitDto: {
            /** @example Eau minérale 1,5L */
            nom: string;
            /** @example 1 */
            id_categorie_produit?: Record<string, never> | null;
            /** @example 500.00 */
            prix_achat: string;
            /** @example 750.00 */
            prix_vente: string;
            /**
             * @description Stock initial à la création — la seule écriture de stock autorisée; ensuite le trigger soldé par les mouvements.
             * @default 0.00
             */
            quantite_initiale: string;
            /** @default 0.00 */
            seuil_alerte: string;
            /** @example 2 */
            id_fournisseur?: Record<string, never> | null;
            /** @example 2026-08-15 */
            date_entree?: string;
            /**
             * @default true
             * @enum {boolean}
             */
            actif: true | false;
        };
        MajProduitDto: {
            nom?: string;
            id_categorie_produit?: Record<string, never> | null;
            prix_achat?: string;
            prix_vente?: string;
            seuil_alerte?: string;
            id_fournisseur?: Record<string, never> | null;
            /** @enum {boolean} */
            actif?: true | false;
        };
        LigneVenteDto: {
            /** @example 1 */
            id_produit: string;
            /** @example 2 */
            quantite: string;
        };
        PaiementVenteDto: {
            /** @example 1500.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerVenteDto: {
            lignes: components["schemas"]["LigneVenteDto"][];
            remise?: string | null;
            /** @example 5 */
            id_client?: Record<string, never> | null;
            paiement: components["schemas"]["PaiementVenteDto"];
        };
        AjouterMouvementDto: {
            /** @example 1 */
            id_produit: string;
            /** @enum {string} */
            type: "ENTREE" | "SORTIE" | "AJUSTEMENT";
            /**
             * @description Signé pour AJUSTEMENT.
             * @example 10.00
             */
            quantite: string;
            /** @example Réappro fournisseur */
            motif?: Record<string, never> | null;
            /** @example BL-2026-0147 */
            document_ref?: Record<string, never> | null;
        };
        CreerCategoriePlatDto: {
            /** @example Grillades */
            libelle: string;
        };
        CreerPlatDto: {
            /** @example Poulet braisé */
            nom: string;
            /** @example 1 */
            id_categorie_plat?: Record<string, never> | null;
            /** @example 3500.00 */
            prix: string;
            /**
             * @default true
             * @enum {boolean}
             */
            disponible: true | false;
            description?: Record<string, never> | null;
            image_url?: Record<string, never> | null;
        };
        MajPlatDto: {
            nom?: string;
            id_categorie_plat?: Record<string, never> | null;
            prix?: string;
            /** @enum {boolean} */
            disponible?: true | false;
            description?: Record<string, never> | null;
            image_url?: Record<string, never> | null;
        };
        LigneCommandeRestaurantDto: {
            /** @example 3 */
            id_plat: string;
            /** @example 2 */
            quantite: string;
        };
        PaiementCommandeDto: {
            /** @example 7000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerCommandeRestaurantDto: {
            /** @enum {string} */
            type: "SUR_PLACE" | "A_EMPORTER" | "LIVRAISON";
            lignes: components["schemas"]["LigneCommandeRestaurantDto"][];
            /** @example 5 */
            id_client?: Record<string, never> | null;
            paiement: components["schemas"]["PaiementCommandeDto"];
        };
        MajStatutCommandeDto: {
            /** @enum {string} */
            statut: "EN_COURS" | "EN_PREPARATION" | "SERVIE" | "PAYEE" | "ANNULEE";
        };
        LigneCommandePressingDto: {
            /** @example Chemise */
            type_vetement: string;
            /** @example 4 */
            quantite: string;
            /** @example Repassage */
            prestation: string;
            /** @example 1000.00 */
            tarif: string;
        };
        PaiementAcompteDto: {
            /** @example 5000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        CreerCommandePressingDto: {
            /** @example 1 */
            id_client: string;
            /** @example 2026-08-18 */
            date_retrait_prevue?: string;
            lignes: components["schemas"]["LigneCommandePressingDto"][];
            paiement?: components["schemas"]["PaiementAcompteDto"];
        };
        MajCommandePressingDto: {
            /** @example 1 */
            id_client?: string;
            /** @example 2026-08-20 */
            date_retrait_prevue?: string;
            lignes?: components["schemas"]["LigneCommandePressingDto"][];
        };
        EncaisserSoldePressingDto: {
            /** @example 7000.00 */
            solde: string;
            /** @example 1 */
            id_moyen: string;
        };
        MajReservationFeteDto: {
            /** @example 2026-08-22 */
            date_evenement?: string;
            /** @example 18:00 */
            heure_debut?: string;
            /** @example 5 */
            duree?: string;
            /** @example Baptême */
            type_manifestation?: string;
            /** @example 200000.00 */
            tarif?: string;
            /** @example 50000.00 */
            acompte?: Record<string, never> | null;
            observations?: Record<string, never> | null;
            /** @enum {string} */
            statut?: "DISPONIBLE" | "RESERVEE" | "CONFIRMEE" | "REALISEE" | "ANNULEE";
        };
        NouveauClientFeteDto: {
            /** @example DIABATE */
            nom: string;
            /** @example Seydou */
            prenoms: string;
            /** @example +2250700000000 */
            tel_principal: string;
            /**
             * @default PASSAGE
             * @enum {string}
             */
            type_client: "LOCATAIRE" | "PASSAGE" | "AUTRE";
        };
        CreerReservationFeteDto: {
            /** @example 1 */
            id_client?: Record<string, never> | null;
            client?: components["schemas"]["NouveauClientFeteDto"];
            /** @example 2026-08-22 */
            date_evenement: string;
            /** @example 18:00 */
            heure_debut: string;
            /** @example 5 */
            duree: string;
            /** @example Baptême */
            type_manifestation: string;
            /** @example 200000.00 */
            tarif: string;
            observations?: Record<string, never> | null;
        };
        PaiementReservationDto: {
            /** @example 50000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
        };
        ConfirmerReservationFeteDto: {
            paiement: components["schemas"]["PaiementReservationDto"];
        };
        RealiserReservationFeteDto: {
            paiement: components["schemas"]["PaiementReservationDto"];
        };
        CreerServiceRhDto: {
            /** @example Sécurité */
            libelle: string;
        };
        MajServiceRhDto: {
            /** @example Sécurité */
            libelle: string;
        };
        CreerEmployeDto: {
            /** @example KOUASSI */
            nom: string;
            /** @example Mariam */
            prenom: string;
            /** @example +225 07 02 00 00 */
            telephone?: string;
            /**
             * @example CAISSIER
             * @enum {string}
             */
            fonction: "RESPONSABLE" | "SERVEUR" | "CAISSIER" | "CUISINIER" | "RESPONSABLE_CUISINE" | "RECEPTIONNISTE" | "OPERATEUR_LAVAGE" | "OPERATEUR_SECHAGE" | "OPERATEUR_REPASSAGE" | "CONTROLEUR_QUALITE" | "AGENT_LIVRAISON" | "AGENT_ENTRETIEN" | "TECHNICIEN" | "VENDEUR" | "MAGASINIER" | "RESPONSABLE_APPROVISIONNEMENT" | "AUTRE";
            /** @example 3 */
            id_service?: string;
            /** @example 2026-03-01 */
            date_embauche: string;
            /** @enum {string} */
            type_contrat: "CDI" | "CDD" | "APPRENTI" | "AUTRE";
            /** @example 180000.00 */
            salaire_base: string;
            /** @example Avertissement */
            autres_infos?: string;
        };
        MajEmployeDto: {
            /** @example KOUASSI */
            nom?: string;
            /** @example Mariam */
            prenom?: string;
            /** @example +225 07 02 00 00 */
            telephone?: string;
            /**
             * @example CAISSIER
             * @enum {string}
             */
            fonction?: "RESPONSABLE" | "SERVEUR" | "CAISSIER" | "CUISINIER" | "RESPONSABLE_CUISINE" | "RECEPTIONNISTE" | "OPERATEUR_LAVAGE" | "OPERATEUR_SECHAGE" | "OPERATEUR_REPASSAGE" | "CONTROLEUR_QUALITE" | "AGENT_LIVRAISON" | "AGENT_ENTRETIEN" | "TECHNICIEN" | "VENDEUR" | "MAGASINIER" | "RESPONSABLE_APPROVISIONNEMENT" | "AUTRE";
            /** @example 3 */
            id_service?: string;
            /** @example 2026-03-01 */
            date_embauche?: string;
            /** @enum {string} */
            type_contrat?: "CDI" | "CDD" | "APPRENTI" | "AUTRE";
            /** @example 180000.00 */
            salaire_base?: string;
            /** @enum {string} */
            statut?: "ACTIF" | "INACTIF" | "SUSPENDU";
            /** @example Avertissement */
            autres_infos?: string;
        };
        MajPointageDto: {
            /**
             * @description Trigger-owned — non appliqué par l’API (trg_pointage_auto).
             * @example 2026-08-15T07:58:00.000Z
             */
            heure_arrivee?: string;
            /** @example 2026-08-15T17:30:00.000Z */
            heure_depart?: string;
            /**
             * @description Trigger-derived — non appliqué par l’API (re-dérivé de heure_depart).
             * @example 9.50
             */
            duree_travaillee?: string;
            /** @enum {string} */
            statut?: "PRESENT" | "ABSENT" | "RETARD" | "CONGE";
            /** @example 2.00 */
            heures_sup?: string;
            /** @example Retard corrigé */
            note?: string;
        };
        PointerArriveeDto: {
            /** @example 1 */
            id_employe: string;
            /** @example 2026-08-15 */
            date: string;
            /**
             * @default PRESENT
             * @enum {string}
             */
            statut: "PRESENT" | "RETARD";
            /** @example Arrivée à 9h45 */
            note?: string;
        };
        CreerPaieDto: {
            /** @example 1 */
            id_employe: string;
            /** @example 2026-08 */
            periode: string;
            /** @example 180000.00 */
            salaire_base: string;
        };
        AjouterElementSalaireDto: {
            /** @enum {string} */
            type: "PRIME" | "AVANCE" | "RETENUE" | "HEURE_SUP" | "AUTRE";
            /** @example Prime de rendement */
            libelle: string;
            /** @example 50000.00 */
            montant: string;
        };
        PayerPaieDto: {
            /** @example 1 */
            id_moyen: string;
        };
        MasquerDonneesDto: {
            /**
             * @description Données JSON à masquer avant affichage
             * @example {
             *       "nom": "Dupont",
             *       "mot_de_passe": "secret"
             *     }
             */
            donnees: Record<string, never>;
        };
        CreerSignalementDto: {
            /** @example Fuite d’eau chambre CH-102 */
            titre: string;
            /** @example Fuite constatée sous le lavabo, plancher humide — intervention nécessaire avant le prochain séjour. */
            description: string;
            /** @description Activité concernée (finances.activite) — absent pour un signalement général. */
            id_activite?: Record<string, never> | null;
        };
        ClotureSignalementDto: {
            /** @example Plombier intervenu le 22/08, fuite réparée. */
            note_resolution: string;
        };
        RestaurerSauvegardeDto: {
            /** @description Confirmation explicite de la restauration (action destructrice). */
            confirmation: boolean;
        };
        MajPlanificationDto: {
            /** @enum {string} */
            frequence: "QUOTIDIENNE" | "HEBDOMADAIRE";
            /**
             * @description HH:MM
             * @example 02:00
             */
            heure: string;
            active: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AppController_getHello_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_login_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout_v1: {
        parameters: {
            query?: never;
            header: {
                authorization: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LogoutDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_me_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_listerUtilisateurs_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                id_role?: string;
                actif?: true | false;
                login?: string;
                nom?: string;
                prenom?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_creerUtilisateur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerUtilisateurDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_detailUtilisateur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_majUtilisateur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajUtilisateurDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_connexions_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_desactiver_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_reinitialiserMotDePasse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReinitialiserMotDePasseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_listerRoles_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_creerRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerRoleDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_supprimerRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_majRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajRoleDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_listerPermissionsRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_majPermissionsRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPermissionsRoleDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_ajouterPermissionRole_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AjouterPermissionRoleDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AdminController_listerPermissions_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoreController_lister_v1: {
        parameters: {
            query?: {
                cle?: string;
                /** @description Recherche texte libre (cle, valeur) */
                recherche?: string;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CORE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoreController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerParametreDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CORE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoreController_trouver_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                cle: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CORE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoreController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                cle: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajParametreDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CORE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_rechercher_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                type_client?: "LOCATAIRE" | "PASSAGE" | "AUTRE";
                nom?: string;
                prenoms?: string;
                sexe?: string;
                nationalite?: string;
                profession?: string;
                tel_principal?: string;
                tel_secondaire?: string;
                email?: string;
                ville?: string;
                pays?: string;
                /** @description Date de naissance >= */
                naissance_du?: string;
                /** @description Date de naissance <= */
                naissance_au?: string;
                /** @description Date d'enregistrement >= */
                enregistre_du?: string;
                /** @description Date d'enregistrement <= */
                enregistre_au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerClientDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajClientDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_ajouterContact_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerContactDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_ajouterPiece_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerPieceDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_majPiece_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
                /** @description Identifiant de la ressource ciblée */
                idPiece: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPieceDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                numero_contrat?: string;
                /** @description Id du client (bigint, string). */
                id_client?: string;
                /** @description Id du logement (bigint, string). */
                id_logement?: string;
                statut?: "EN_ATTENTE" | "ACTIF" | "EXPIRE" | "RESILIE" | "TERMINE";
                type_location?: "MENSUEL" | "ANNUEL";
                periodicite?: string | null;
                montant_loyer?: string;
                du?: string;
                au?: string;
                /** @description Date de fin prévue >= */
                fin_du?: string;
                /** @description Date de fin prévue <= */
                fin_au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerContratDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_devenirResident_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DevenirResidentDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_pdfContrat_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Document PDF renvoyé avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_etatDesLieux_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                type?: "ENTREE" | "SORTIE";
            };
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_ajouterPhotoEtatDesLieux_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AjouterPhotoEtatLieuxDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_supprimerPhotoEtatDesLieux_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_caution_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_restituerCaution_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestituerCautionDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_activer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_reviser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviserLoyerDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_encaisser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EncaisserLoyerDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_recuEcheance_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Document PDF renvoyé avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_suivi_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                numero_contrat?: string;
                client?: string;
                logement?: string;
                batiment?: string;
                mois?: number;
                annee?: number;
                montant?: string;
                du?: string;
                au?: string;
                statut?: "PAYE" | "IMPAYE" | "A_VENIR" | "PARTIEL";
                id_utilisateur_encaisseur?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_impayes_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Id du client (bigint, string). */
                id_client?: string;
                client?: string;
                numero_contrat?: string;
                logement?: string;
                batiment?: string;
                montant?: string;
                du?: string;
                au?: string;
                statut?: "IMPAYE" | "PARTIEL";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_occupation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BatimentsController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                code?: string;
                nom?: string;
                actif?: true | false;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BatimentsController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerBatimentDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BatimentsController_supprimer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BatimentsController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajBatimentDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogementsController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Id du bâtiment (bigint, string). */
                batiment?: string;
                numero?: string;
                nom?: string;
                statut?: "DISPONIBLE" | "RESERVE" | "OCCUPE" | "EN_NETTOYAGE" | "EN_MAINTENANCE" | "INDISPONIBLE";
                type?: "CHAMBRE" | "STUDIO" | "APPARTEMENT" | "MEUBLE";
                tarif?: string;
                etat?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogementsController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerLogementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogementsController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogementsController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajLogementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                type?: "NUITEE" | "SIESTE";
                statut?: "EN_COURS" | "TERMINE" | "ANNULE";
                du?: string;
                au?: string;
                /** @description Id du client (bigint, string). */
                id_client?: string;
                /** @description Id du logement (bigint, string). */
                id_logement?: string;
                /** @description Id du moyen de paiement (bigint, string). */
                id_moyen_paiement?: string;
                tarif?: string;
                montant_total?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerSejourDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajSejourDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_payer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PayerSejourDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.ENCAISSER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_categories_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                libelle?: string;
                actif?: true | false;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_creerCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCategorieChargeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_majCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajCategorieChargeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Id du logement (bigint, string). */
                logement?: string;
                periode?: string;
                /** @description Id de la catégorie de charge (bigint, string). */
                categorie?: string;
                compteur_numero?: string;
                montant?: string;
                statut?: "IMPAYEE" | "PARTIELLE" | "PAYEE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerChargeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_payer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PayerChargeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.ENCAISSER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AbonnementsController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Id du client (bigint, string). */
                id_client?: string;
                /** @description Id du logement (bigint, string). */
                id_logement?: string;
                service?: string;
                type?: "MENSUEL" | "ANNUEL" | "PERIODIQUE";
                montant?: string;
                statut?: "ACTIF" | "SUSPENDU" | "RESILIE" | "EXPIRE";
                du?: string;
                au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AbonnementsController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerAbonnementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AbonnementsController_maj_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajAbonnementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AbonnementsController_resilier_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_resume_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Récapitulatif locatif : dossier, contrat en cours, prochaine échéance, total des impayés. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PortailResumeDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_echeances_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Échéances de loyer du résident, mêmes statuts que `GET /residence/suivi`. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PortailEcheancesDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_etatDesLieux_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Photos d’état des lieux (ENTREE/SORTIE) de tous les contrats du résident. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_paiements_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Historique des paiements : loyers + factures (charges/autres), triés du plus récent au plus ancien. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PortailPaiementsDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_caution_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Caution du contrat en cours + historique des événements. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PortailCautionResponseDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_recuEcheance_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Reçu d’une échéance réglée. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecuEcheanceDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Échéance inconnue ou appartenant à un autre client. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortailController_recuPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Reçu d’un paiement. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecuPaiementDto"];
                };
            };
            /** @description Jeton invalide ou expiré */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Paiement inconnu ou n’appartenant pas au résident. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_prestations_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                actif?: true | false;
                libelle?: string;
                categorie?: string | null;
                prix?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_creerPrestation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerPrestationDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_majPrestation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPrestationDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_facturer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FacturerPrestationDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_factures_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                statut?: "PAYEE" | "PARTIELLE" | "IMPAYEE" | "ANNULEE";
                source_type?: "VENTE" | "COMMANDE_PRESSING" | "COMMANDE_RESTAURANT" | "SEJOUR" | "CHARGE" | "LOCATION" | "RESERVATION_FETE" | "PRESTATION" | "AUTRE";
                id_client?: string;
                id_activite?: string;
                numero?: string;
                libelle?: string;
                montant_total?: string;
                /** @description Date >= */
                du?: string;
                /** @description Date <= */
                au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_detailFacture_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_majFacture_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajFactureDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_pdfFacture_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_ticketFacture_v1: {
        parameters: {
            query?: {
                largeur?: 58 | 80;
            };
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Document PDF renvoyé avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FACTURATION.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_consolidation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_tableauDeBord_v1: {
        parameters: {
            query?: {
                format?: "json" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_activites_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                actif?: true | false;
                code?: string;
                libelle?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_paiements_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                type?: "ENCAISSEMENT" | "DECAISSEMENT";
                id_moyen?: string;
                id_activite?: string;
                id_utilisateur?: string;
                /** @description Filtre par caisse — pour un utilisateur assigné à une caisse, doit correspondre à la sienne (400 sinon). */
                id_caisse?: string;
                /** @description Ne renvoie que les paiements sans caisse assignée (saisis par un admin sans id_caisse) — réservé à un utilisateur non scopé, sinon sans effet puisqu'il n'a accès qu'à sa propre caisse. */
                sans_caisse?: boolean;
                motif?: string;
                reference?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerPaiementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_paiementsParUtilisateur_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                /** @description Filtre par caisse — permet à un admin de voir, pour une caisse donnée, ce que chaque employé y a rapporté. Pour un utilisateur assigné à une caisse, doit correspondre à la sienne (400 sinon). */
                id_caisse?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_majPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPaiementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_depenses_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                id_categorie_depense?: string;
                id_activite?: string;
                id_utilisateur?: string;
                /** @description Filtre par caisse — pour un utilisateur assigné à une caisse, doit correspondre à la sienne (400 sinon). */
                id_caisse?: string;
                /** @description Ne renvoie que les dépenses sans caisse assignée (saisies par un admin sans id_caisse) — réservé à un utilisateur non scopé, sinon sans effet puisqu'il n'a accès qu'à sa propre caisse. */
                sans_caisse?: boolean;
                libelle?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerDepenseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_supprimerDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_majDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajDepenseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_categoriesDepenses_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerCategorieDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCategorieDepenseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_supprimerCategorieDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_majCategorieDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajCategorieDepenseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_hintCategorieDepense_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_impayes_v1: {
        parameters: {
            query?: {
                type?: "LOYER" | "CHARGE" | "FACTURE";
                /** @description Id du client (bigint, string). */
                client?: string;
                periode?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_moyensPaiement_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                actif?: true | false;
                libelle?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerMoyenPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerMoyenPaiementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_majMoyenPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajMoyenPaiementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_caisses_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerCaisse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCaisseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_majCaisse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajCaisseDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_dashboardCaisse_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la caisse */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_tirages_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                id_caisse?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_creerTirage_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerTirageDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_categories_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                libelle?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_creerCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCategorieProduitDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_desactiverCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_majCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajCategorieProduitDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_fournisseurs_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                nom?: string;
                contact?: string;
                telephone?: string;
                email?: string;
                adresse?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_creerFournisseur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerFournisseurDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_desactiverFournisseur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Suppression effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_majFournisseur_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajFournisseurDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_produits_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                id_categorie_produit?: string;
                id_fournisseur?: string;
                reference?: string;
                nom?: string;
                prix_achat?: string;
                prix_vente?: string;
                entree_du?: string;
                entree_au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_creerProduit_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerProduitDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_detailProduit_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_majProduit_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajProduitDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_ventes_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                statut?: "EN_COURS" | "PAYEE" | "ANNULEE";
                id_client?: string;
                id_utilisateur?: string;
                total?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_creerVente_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerVenteDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_rapportVentes_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_detailVente_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_annulerVente_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_ajouterMouvement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AjouterMouvementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_stockAlerte_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_stockHistorique_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                reference?: string;
                type?: "ENTREE" | "SORTIE" | "AJUSTEMENT";
                du?: string;
                au?: string;
                quantite_mouvement?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_reesolde_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.SUPERVISER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_categories_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_creerCategorie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCategoriePlatDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_plats_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                id_categorie_plat?: string;
                disponible?: true | false;
                nom?: string;
                prix?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_creerPlat_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerPlatDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_detailPlat_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_majPlat_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPlatDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_majImagePlat_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_commandes_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                statut?: "EN_COURS" | "EN_PREPARATION" | "SERVIE" | "PAYEE" | "ANNULEE";
                id_client?: string;
                type?: "SUR_PLACE" | "A_EMPORTER" | "LIVRAISON";
                total?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_creerCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCommandeRestaurantDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_detailCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_majStatutCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajStatutCommandeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VALIDER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_annulerCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_rapportVentes_v1: {
        parameters: {
            query: {
                du: string;
                au: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESTAURANT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UploadsController_telecharger_v1: {
        parameters: {
            query: {
                key: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UploadsController_upload_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert CLIENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_commandes_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                statut?: "DEPOSE" | "EN_TRAITEMENT" | "PRET" | "RETIRE" | "ANNULEE";
                id_client?: string;
                numero_commande?: string;
                montant_total?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_creerCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerCommandePressingDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_detailCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_majCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajCommandePressingDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_passageTraitement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.TRAITER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_passagePret_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.MARQUER_PRET */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_retirerCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EncaisserSoldePressingDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.RETIRER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PressingController_annulerCommande_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert PRESSING.ANNULER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_reservations_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                du?: string;
                au?: string;
                statut?: "DISPONIBLE" | "RESERVEE" | "CONFIRMEE" | "REALISEE" | "ANNULEE";
                id_client?: string;
                type_manifestation?: string;
                tarif?: string;
                observations?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_creerReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerReservationFeteDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_detailReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_majReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajReservationFeteDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_disponibilites_v1: {
        parameters: {
            query: {
                date: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_confirmerReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmerReservationFeteDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.VALIDER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_realiserReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RealiserReservationFeteDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalleFeteController_annulerReservation_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SALLE_FETE.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_services_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_creerService_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerServiceRhDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_majService_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajServiceRhDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_employes_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Employés sans compte lié */
                sans_compte?: boolean;
                id_service?: string;
                statut?: "ACTIF" | "INACTIF" | "SUSPENDU";
                type_contrat?: "CDI" | "CDD" | "APPRENTI" | "AUTRE";
                nom?: string;
                prenom?: string;
                telephone?: string;
                fonction?: "RESPONSABLE" | "SERVEUR" | "CAISSIER" | "CUISINIER" | "RESPONSABLE_CUISINE" | "RECEPTIONNISTE" | "OPERATEUR_LAVAGE" | "OPERATEUR_SECHAGE" | "OPERATEUR_REPASSAGE" | "CONTROLEUR_QUALITE" | "AGENT_LIVRAISON" | "AGENT_ENTRETIEN" | "TECHNICIEN" | "VENDEUR" | "MAGASINIER" | "RESPONSABLE_APPROVISIONNEMENT" | "AUTRE";
                /** @description Date d'embauche >= */
                embauche_du?: string;
                /** @description Date d'embauche <= */
                embauche_au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_creerEmploye_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerEmployeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_detailEmploye_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_majEmploye_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajEmployeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_pointages_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                employe?: string;
                service?: string;
                du?: string;
                au?: string;
                statut?: "PRESENT" | "ABSENT" | "RETARD" | "CONGE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_pointerArrivee_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PointerArriveeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_detailPointage_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_majPointage_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPointageDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_pointerDepart_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_paies_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                id_employe?: string;
                statut?: "CALCULEE" | "VALIDEE" | "PAYEE" | "ANNULEE";
                montant_a_payer?: string;
                /** @description Période >= (YYYY-MM) */
                du?: string;
                /** @description Période <= (YYYY-MM) */
                au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_creerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerPaieDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_detailPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_pdfBulletin_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_ajouterElement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AjouterElementSalaireDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_recalculerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_validerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VALIDER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_annulerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.SUPPRIMER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_payerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PayerPaieDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RapportsController_syntheseGlobale_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                format?: "json" | "csv" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RapportsController_financier_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                format?: "json" | "csv" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RapportsController_activites_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                format?: "json" | "csv" | "pdf" | "xlsx";
            };
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR, ou RAPPORTS.VOIR pour son activité assignée */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RapportsController_rh_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                format?: "json" | "csv" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RapportsController_series_v1: {
        parameters: {
            query?: {
                du?: string;
                au?: string;
                pas?: "jour" | "semaine" | "mois";
                format?: "json" | "csv" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DashboardController_dashboard_v1: {
        parameters: {
            query?: {
                /** @description Début de la période (YYYY-MM-DD). Omis = premier jour du mois de `au`. */
                du?: string;
                /** @description Fin de la période (YYYY-MM-DD). Omis = date du jour. */
                au?: string;
                /** @description Code activité (finances.activite.code) pour un état détaillé. Omis = vision GLOBAL. */
                activite?: "VENTE_MARCHANDISES" | "PRESSING" | "RESTAURATION" | "SALLE_FETE" | "LOCATION_RESIDENTIEL" | "LOCATION_COMMERCIAL";
                format?: "json" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR (vue globale) ou RAPPORTS.VOIR pour son activité (?activite=) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DashboardController_tableauDeBord_v1: {
        parameters: {
            query?: {
                /** @description Début de la période (YYYY-MM-DD). Omis = premier jour du mois de `au`. */
                du?: string;
                /** @description Fin de la période (YYYY-MM-DD). Omis = date du jour. */
                au?: string;
                format?: "json" | "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert FINANCES.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuditController_journal_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                utilisateur?: string;
                module?: string;
                du?: string;
                au?: string;
                entite?: string;
                entite_id?: string;
                operation?: string;
                adresse_ip?: string;
                /** @description Format d’export du rapport (chiffres clés, graphiques, détail). Omis = JSON paginé. */
                format?: "pdf" | "xlsx";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert AUDIT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuditController_masquer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MasquerDonneesDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert AUDIT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_lister_v1: {
        parameters: {
            query?: {
                /** @description Recherche texte libre */
                recherche?: string;
                /** @description Colonne de tri */
                sort?: string;
                order?: "asc" | "desc";
                limit?: number;
                offset?: number;
                /** @description Id de l’activité concernée (bigint, string). */
                id_activite?: string;
                statut?: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
                id_utilisateur_declarant?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_creer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreerSignalementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.CREER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_detail_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_prendreEnCharge_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_resoudre_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClotureSignalementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SignalementController_rejeter_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClotureSignalementDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert SIGNALEMENT.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SauvegardesController_lister_v1: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SauvegardesController_declencher_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SauvegardesController_restaurer_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Identifiant de la ressource ciblée */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestaurerSauvegardeDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SauvegardesController_getPlanification_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.VOIR */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SauvegardesController_majPlanification_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MajPlanificationDto"];
            };
        };
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert ADMIN.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_live_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_ready_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /**
             * @description Données renvoyées avec succès
             *
             *     The Health Check is successful
             */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /** @example {} */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            /** @description The Health Check is not successful */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example error */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       },
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
        };
    };
    HealthController_aggregate_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /**
             * @description Données renvoyées avec succès
             *
             *     The Health Check is successful
             */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /** @example {} */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            /** @description The Health Check is not successful */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example error */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       },
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
        };
    };
    JobsController_genererEcheances_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobsController_reesoldeStock_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert MARCHANDISE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobsController_recalculerPaie_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RH.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    JobsController_transitionnerContratsExpires_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Opération effectuée avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Permission refusée — requiert RESIDENCE.MODIFIER */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MetricsController_scrape: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Données renvoyées avec succès */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
