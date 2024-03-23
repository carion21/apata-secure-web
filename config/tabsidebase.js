const Sidebare = require('../config/sidebare')
const ElementSidebare = require('../config/element_sidebare')
const BlocSidebare = require('./bloc_sidebare')
const { DEFAULT_ROUTE_ADMIN, DEFAULT_ROUTE_INTERMED } = require('./consts')


class TabSidebase {

  constructor() {

  }

  /**
   * MENU DU COMPTE ADMIN
   */

  static admin() {
    return [
      BlocSidebare.nouveauBloc(
        "accueil",
        [
          ElementSidebare.nouveauElement("Tableau de bord", DEFAULT_ROUTE_ADMIN + "", "index", "bx bx-home", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "gestion des documents",
        [
          ElementSidebare.nouveauElement("Documents", DEFAULT_ROUTE_ADMIN + "/document_management/document_list", "document_management/document_list", "bx bx-package", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "gestion des clients",
        [
          ElementSidebare.nouveauElement("Clients", DEFAULT_ROUTE_ADMIN + "/client_management/client_list", "client_management/client_list", "bx bx-smile", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "gestion des intermediaires",
        [
          ElementSidebare.nouveauElement("Intervenants", DEFAULT_ROUTE_ADMIN + "/intermed_management/intermed_list", "intermed_management/intermed_list", "bx bx-smile", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "mon compte",
        [
          ElementSidebare.nouveauElement("Détails du compte", DEFAULT_ROUTE_ADMIN + "/user_management/account_details", "user_management/account_details", "bx bx-cog", 0),
          ElementSidebare.nouveauElement("Sécurité", DEFAULT_ROUTE_ADMIN + "/user_management/security", "user_management/security", "bx bx-lock-alt", 0),
          ElementSidebare.nouveauElement("Déconnexion", "/security/logout", "security/logout", "bx bx-log-out", 0),
        ]
      ),
    ]
  }

  /**
   * MENU DU COMPTE INTERMED
   */

  static intermed() {
    return [
      BlocSidebare.nouveauBloc(
        "accueil",
        [
          ElementSidebare.nouveauElement("Tableau de bord", DEFAULT_ROUTE_INTERMED + "", "index", "bx bx-home", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "gestion des documents",
        [
          ElementSidebare.nouveauElement("Documents", DEFAULT_ROUTE_INTERMED + "/document_management/document_list", "document_management/document_list", "bx bx-package", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "gestion des dossiers",
        [
          ElementSidebare.nouveauElement("Folders", DEFAULT_ROUTE_INTERMED + "/folder_management/folder_list", "folder_management/folder_list", "bx bx-smile", 0),
        ]
      ),
      BlocSidebare.nouveauBloc(
        "mon compte",
        [
          ElementSidebare.nouveauElement("Détails du compte", DEFAULT_ROUTE_INTERMED + "/user_management/account_details", "user_management/account_details", "bx bx-cog", 0),
          ElementSidebare.nouveauElement("Sécurité", DEFAULT_ROUTE_INTERMED + "/user_management/security", "user_management/security", "bx bx-lock-alt", 0),
          ElementSidebare.nouveauElement("Déconnexion", "/security/logout", "security/logout", "bx bx-log-out", 0),
        ]
      ),
    ]
  }

}

module.exports = TabSidebase