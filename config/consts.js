
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

    static USERPROFILE_TYPES = [
        Consts.USERPROFILE_TYPE_ADMIN
    ];

    static DEFAULT_PROFILE_ADMIN = "admin";

    static DEFAULT_PROFILES = [
        Consts.DEFAULT_PROFILE_ADMIN
    ];
    
    static DEFAULT_ROUTE_ADMIN = "/"+Consts.DEFAULT_PROFILE_ADMIN;

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

    static QRGENERATOR_URL = "https://qrgeneratorv1.geasscorp.com";

    static ROUTE_OF_QRGENERATOR_TO_GENERATE = "/generate";
    static ROUTE_OF_QRGENERATOR_FOR_IMAGE = "/images";

    static DIRECTUS_URL = "http://167.86.106.97"

    static ROUTE_OF_DIRECTUS_TO_VERIFY_HASH = "/utils/hash/verify"
    
    static ROUTE_OF_DIRECTUS_FOR_CONNECTION_HISTORY="/items/connection_history"
    static ROUTE_OF_DIRECTUS_FOR_PROFILE="/items/profile"
    static ROUTE_OF_DIRECTUS_FOR_APS_DOCUMENT="/items/aps_document"
    static ROUTE_OF_DIRECTUS_FOR_USER="/items/user"



    static SERVICE_TYPES = [
        "undefined",
        "security_login",
        "admin_new_client",
        "admin_account_details",
        "admin_security"
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
        "admin_account_details": {
            "fields": ["lastname", "firstname", "email", "phone"],
            "types": ["string", "string", "string_email", "string_integer"],
            "required": ["lastname", "firstname", "phone"]
        },
        "admin_security": {
            "fields": ["current_password", "new_password", "confirm_new_password"],
            "types": ["string", "string", "string"],
            "required": ["current_password", "new_password", "confirm_new_password"]
        }
    };

}

module.exports = Consts;