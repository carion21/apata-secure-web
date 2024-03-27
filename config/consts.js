
class Consts {
    static NLIMIT = 10;

    static PORT_SYSTEM = 6055
    static APP_NAME = "Apata Secure"
    static APP_AUTHOR = "Carion21"
    static APP_VERSION = "1.0.0"
    static APP_DESCRIPTION = "Système de signature et d'authentification sécurisé de documents électroniques"

    static USERPROFILE_TYPE_UNDEFINED = 0;
    static USERPROFILE_TYPE_ADMIN = 6;
    static USERPROFILE_TYPE_CLIENT = 7;
    static USERPROFILE_TYPE_INTERMED = 8;
    static USERPROFILE_TYPE_AGENT = 9;

    static USERPROFILE_TYPES = [
        Consts.USERPROFILE_TYPE_ADMIN,
        Consts.USERPROFILE_TYPE_INTERMED,
        Consts.USERPROFILE_TYPE_AGENT,
    ];

    static DEFAULT_PROFILE_ADMIN = "admin";
    static DEFAULT_PROFILE_INTERMED = "intermed";
    static DEFAULT_PROFILE_AGENT = "agent";

    static DEFAULT_PROFILES = [
        Consts.DEFAULT_PROFILE_ADMIN,
        Consts.DEFAULT_PROFILE_INTERMED,
        Consts.DEFAULT_PROFILE_AGENT,
    ];
    
    static DEFAULT_ROUTE_ADMIN = "/"+Consts.DEFAULT_PROFILE_ADMIN;
    static DEFAULT_ROUTE_INTERMED = "/"+Consts.DEFAULT_PROFILE_INTERMED;
    static DEFAULT_ROUTE_AGENT = "/"+Consts.DEFAULT_PROFILE_AGENT;

    static DEFAULT_ROUTES = {
        [Consts.USERPROFILE_TYPE_ADMIN]: Consts.DEFAULT_ROUTE_ADMIN,
        [Consts.USERPROFILE_TYPE_INTERMED]: Consts.DEFAULT_ROUTE_INTERMED,
        [Consts.USERPROFILE_TYPE_AGENT]: Consts.DEFAULT_ROUTE_AGENT,
    };

    static DEFAULT_TYPES = [
        "string",
        "string_not_empty",
        "string_email",
        "string_date",
        "string_integer",
        "string_boolean",
        "number",
        "integer",
        "boolean",
        "object",
        "array",
        "array_of_string",
        "array_of_number",
        "array_of_integer",
        "array_of_boolean",
        "array_of_object",
        "array_of_string_integer"
    ];

    static DEFAULT_DURATION_OF_document = 0.1; // minutes

    static QRGENERATOR_URL = "https://qrgen.geasscorp.com";

    static ROUTE_OF_QRGENERATOR_TO_GENERATE = "/generate";
    static ROUTE_OF_QRGENERATOR_FOR_IMAGE = "/images";

    static DIRECTUS_URL = "http://167.86.106.97"

    static ROUTE_OF_DIRECTUS_TO_VERIFY_HASH = "/utils/hash/verify"
    
    static ROUTE_OF_DIRECTUS_FOR_CONNECTION_HISTORY="/items/connection_history"
    static ROUTE_OF_DIRECTUS_FOR_PROFILE="/items/profile"
    static ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT="/items/aps_document"
    static ROUTE_OF_DIRECTUS_FOR_USER="/items/user"
    static ROUTE_OF_DIRECTUS_FOR_APS_PROFILE="/items/aps_profile"
    static ROUTE_OF_DIRECTUS_FOR_APS_PROJECT="/items/aps_project_type"
    static ROUTE_OF_DIRECTUS_FOR_APS_FOLDER="/items/aps_folder"
    static ROUTE_OF_DIRECTUS_FOR_APS_FOLDER_ACTOR="/items/aps_folder_actor"
    static ROUTE_OF_DIRECTUS_FOR_TOWN_HALL="/items/aps_town_hall"
    static ROUTE_OF_DIRECTUS_FOR_TOWN_HALL_DOCUMENT_TYPE="/items/aps_town_hall_document_type"



    static SERVICE_TYPES = [
        "undefined",
        "security_login",
        "admin_new_client",
        "admin_new_intermed",
        "admin_new_agent",
        "admin_account_details",
        "admin_security",
        "intermed_search_folder",
        "intermed_new_document",
        "intermed_edit_folder",
        "intermed_account_details",
        "intermed_security",
        "agent_new_document",
        "agent_account_details",
        "agent_security",
    ];

    static SERVICE_TYPES_FIELDS = {
        "undefined": {},
        "security_login": {
            "fields": ["email", "password"],
            "types": ["string_email", "string"],
            "required": ["email", "password"]
        },
        "admin_new_client": {
            "fields": ["lastname", "firstname", "email", "phone"],
            "types": ["string", "string", "string_email", "string_integer"],
            "required": ["lastname", "firstname", "phone"]
        },
        "admin_new_intermed": {
            "fields": ["lastname", "firstname", "email", "phone", "profile", "project"],
            "types": ["string", "string", "string_email", "string_integer", "string_integer", "string_integer"],
            "required": ["lastname", "firstname", "phone", "profile", "project"]
        },
        "admin_new_agent": {
            "fields": ["lastname", "firstname", "email", "phone", "town"],
            "types": ["string", "string", "string_email", "string_integer", "string_integer"],
            "required": ["lastname", "firstname", "phone", "town"]
        },
        "admin_account_details": {
            "fields": ["lastname", "firstname", "email", "phone"],
            "types": ["string", "string", "string_email", "string_integer"],
            "required": ["lastname", "firstname", "phone"]
        },
        "admin_security": {
            "fields": ["current_password", "new_password", "confirm_new_password"],
            "types": ["string", "string", "string"],
            "required": ["current_password", "new_password", "confirm_new_password"]
        },
        "intermed_search_folder": {
            "fields": ["code"],
            "types": ["string"],
            "required": ["code"]
        },
        "intermed_edit_folder": {
            "fields": ["name", "description"],
            "types": ["string", "string"],
            "required": ["name"]
        },
        "intermed_new_document": {
            "fields": ["title", "folder"],
            "types": ["string", "string_integer"],
            "required": ["title", "folder"]
        },
        "intermed_account_details": {
            "fields": ["lastname", "firstname", "email", "phone"],
            "types": ["string", "string", "string_email", "string_integer"],
            "required": ["lastname", "firstname", "phone"]
        },
        "intermed_security": {
            "fields": ["current_password", "new_password", "confirm_new_password"],
            "types": ["string", "string", "string"],
            "required": ["current_password", "new_password", "confirm_new_password"]
        },
        "agent_new_document": {
            "fields": ["document_type"],
            "types": ["string_integer"],
            "required": ["document_type"]
        },
        "agent_account_details": {
            "fields": ["lastname", "firstname", "email", "phone"],
            "types": ["string", "string", "string_email", "string_integer"],
            "required": ["lastname", "firstname", "phone"]
        },
        "agent_security": {
            "fields": ["current_password", "new_password", "confirm_new_password"],
            "types": ["string", "string", "string"],
            "required": ["current_password", "new_password", "confirm_new_password"]
        },
    };

}

module.exports = Consts;