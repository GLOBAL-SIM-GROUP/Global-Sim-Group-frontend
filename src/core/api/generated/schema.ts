export interface paths {
    "/api/v1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
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
        get: operations["AdminController_listerUtilisateurs_v1"];
        put?: never;
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
        get: operations["AdminController_detailUtilisateur_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["AdminController_listerRoles_v1"];
        put?: never;
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
        delete: operations["AdminController_supprimerRole_v1"];
        options?: never;
        head?: never;
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
        get: operations["AdminController_listerPermissionsRole_v1"];
        put: operations["AdminController_majPermissionsRole_v1"];
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
        get: operations["CoreController_lister_v1"];
        put?: never;
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
        get: operations["CoreController_trouver_v1"];
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
        get: operations["ClientController_rechercher_v1"];
        put?: never;
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
        get: operations["ClientController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        post: operations["ClientController_ajouterPiece_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/residence/contrats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ResidenceController_lister_v1"];
        put?: never;
        post: operations["ResidenceController_creer_v1"];
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
        get: operations["ResidenceController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
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
        post: operations["ResidenceController_encaisser_v1"];
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
        get: operations["BatimentsController_lister_v1"];
        put?: never;
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
        delete: operations["BatimentsController_supprimer_v1"];
        options?: never;
        head?: never;
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
        get: operations["LogementsController_lister_v1"];
        put?: never;
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
        get: operations["LogementsController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["SejoursController_lister_v1"];
        put?: never;
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
        get: operations["SejoursController_detail_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["ChargesController_categories_v1"];
        put?: never;
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
        get: operations["ChargesController_lister_v1"];
        put?: never;
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
        get: operations["AbonnementsController_lister_v1"];
        put?: never;
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
        post: operations["AbonnementsController_resilier_v1"];
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
        get: operations["FacturationController_prestations_v1"];
        put?: never;
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
        get: operations["FacturationController_detailFacture_v1"];
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
        get: operations["FinancesController_paiements_v1"];
        put?: never;
        post: operations["FinancesController_creerPaiement_v1"];
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
        get: operations["FinancesController_depenses_v1"];
        put?: never;
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
        delete: operations["FinancesController_supprimerDepense_v1"];
        options?: never;
        head?: never;
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
        get: operations["FinancesController_categoriesDepenses_v1"];
        put?: never;
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
        delete: operations["FinancesController_supprimerCategorieDepense_v1"];
        options?: never;
        head?: never;
        patch: operations["FinancesController_majCategorieDepense_v1"];
        trace?: never;
    };
    "/api/v1/finances/impayes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
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
        get: operations["FinancesController_moyensPaiement_v1"];
        put?: never;
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
        patch: operations["FinancesController_majMoyenPaiement_v1"];
        trace?: never;
    };
    "/api/v1/market/categories-produits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MarketController_categories_v1"];
        put?: never;
        post: operations["MarketController_creerCategorie_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/fournisseurs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MarketController_fournisseurs_v1"];
        put?: never;
        post: operations["MarketController_creerFournisseur_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/market/produits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MarketController_produits_v1"];
        put?: never;
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
        get: operations["MarketController_detailProduit_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["MarketController_ventes_v1"];
        put?: never;
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
        get: operations["RestaurantController_categories_v1"];
        put?: never;
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
        get: operations["RestaurantController_plats_v1"];
        put?: never;
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
        get: operations["RestaurantController_detailPlat_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["RestaurantController_majPlat_v1"];
        trace?: never;
    };
    "/api/v1/restaurant/commandes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RestaurantController_commandes_v1"];
        put?: never;
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
        get: operations["RestaurantController_rapportVentes_v1"];
        put?: never;
        post?: never;
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
        get: operations["PressingController_commandes_v1"];
        put?: never;
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
        get: operations["PressingController_detailCommande_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["SalleFeteController_reservations_v1"];
        put?: never;
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
        get: operations["SalleFeteController_detailReservation_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["RhController_services_v1"];
        put?: never;
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
        get: operations["RhController_employes_v1"];
        put?: never;
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
        get: operations["RhController_detailEmploye_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["RhController_pointages_v1"];
        put?: never;
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
        get: operations["RhController_detailPointage_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
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
        get: operations["RhController_paies_v1"];
        put?: never;
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
        get: operations["RhController_detailPaie_v1"];
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
        get: operations["RapportsController_series_v1"];
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
        post: operations["AuditController_masquer_v1"];
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
        get: operations["UploadsController_telecharger_v1"];
        put?: never;
        post: operations["UploadsController_upload_v1"];
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
        post: operations["JobsController_recalculerPaie_v1"];
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
            /** @example 5 */
            id_employe?: Record<string, never> | null;
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
            id_employe?: Record<string, never> | null;
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
            copie_num?: Record<string, never> | null;
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
            /** @example CH-104 */
            numero: string;
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
            numero?: string;
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
        CreerPaiementDto: {
            /** @example 25000.00 */
            montant: string;
            /** @example 1 */
            id_moyen: string;
            /** @example 2 */
            id_activite?: string;
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
        CreerCategorieProduitDto: {
            /** @example Boissons */
            libelle: string;
        };
        CreerFournisseurDto: {
            /** @example SODEXCO */
            nom: string;
            contact?: Record<string, never> | null;
            telephone?: Record<string, never> | null;
            email?: Record<string, never> | null;
            adresse?: Record<string, never> | null;
        };
        CreerProduitDto: {
            /** @example REF-001 */
            reference: string;
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
            reference?: string;
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
        };
        MajPlatDto: {
            nom?: string;
            id_categorie_plat?: Record<string, never> | null;
            prix?: string;
            /** @enum {boolean} */
            disponible?: true | false;
            description?: Record<string, never> | null;
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
            /** @example Caissière */
            fonction: string;
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
            /** @example Caissière */
            fonction?: string;
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
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            201: {
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
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CoreController_lister_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                cle: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientController_rechercher_v1: {
        parameters: {
            query: {
                recherche: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            201: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ResidenceController_lister_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            201: {
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
            201: {
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
                du?: string;
                au?: string;
                statut?: "PAYE" | "IMPAYE" | "A_VENIR" | "PARTIEL";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BatimentsController_lister_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogementsController_lister_v1: {
        parameters: {
            query: {
                batiment: string;
                statut: string;
                type: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SejoursController_lister_v1: {
        parameters: {
            query: {
                type: string;
                statut: string;
                du: string;
                au: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_categories_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ChargesController_lister_v1: {
        parameters: {
            query: {
                logement: string;
                periode: string;
                categorie: string;
                statut: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AbonnementsController_lister_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_prestations_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FacturationController_factures_v1: {
        parameters: {
            query: {
                statut: string;
                source_type: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_tableauDeBord_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_activites_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                du?: string;
                au?: string;
                type?: "ENCAISSEMENT" | "DECAISSEMENT";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
                du?: string;
                au?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FinancesController_moyensPaiement_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_categories_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_fournisseurs_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_produits_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                du?: string;
                au?: string;
                statut?: "EN_COURS" | "PAYEE" | "ANNULEE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarketController_stockHistorique_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RestaurantController_plats_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                du?: string;
                au?: string;
                statut?: "EN_COURS" | "EN_PREPARATION" | "SERVIE" | "PAYEE" | "ANNULEE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            200: {
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
                recherche?: string;
                du?: string;
                au?: string;
                statut?: "DEPOSE" | "EN_TRAITEMENT" | "PRET" | "RETIRE" | "ANNULEE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
                du?: string;
                au?: string;
                statut?: "DISPONIBLE" | "RESERVEE" | "CONFIRMEE" | "REALISEE" | "ANNULEE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
            200: {
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
            201: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            200: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_employes_v1: {
        parameters: {
            query: {
                sans_compte: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_pointages_v1: {
        parameters: {
            query: {
                employe: string;
                service: string;
                du: string;
                au: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RhController_paies_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
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
            201: {
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
                format?: "json" | "csv";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                format?: "json" | "csv";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                format?: "json" | "csv";
            };
            header?: never;
            path: {
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
                format?: "json" | "csv";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuditController_journal_v1: {
        parameters: {
            query: {
                utilisateur: string;
                module: string;
                du: string;
                au: string;
                recherche: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
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
            201: {
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
            200: {
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
            201: {
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
            /** @description The Health Check is successful */
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
            /** @description The Health Check is successful */
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
            201: {
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
            201: {
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
            201: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
