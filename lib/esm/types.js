;
;
;
;
export var E_SAMPQUERY_ERROR;
(function (E_SAMPQUERY_ERROR) {
    E_SAMPQUERY_ERROR[E_SAMPQUERY_ERROR["NONE"] = 0] = "NONE";
    E_SAMPQUERY_ERROR[E_SAMPQUERY_ERROR["SOCKET_ERROR"] = 1] = "SOCKET_ERROR";
    E_SAMPQUERY_ERROR[E_SAMPQUERY_ERROR["INVALID_HOST"] = 2] = "INVALID_HOST";
    E_SAMPQUERY_ERROR[E_SAMPQUERY_ERROR["INVALID_PACKET_LEN"] = 3] = "INVALID_PACKET_LEN";
})(E_SAMPQUERY_ERROR || (E_SAMPQUERY_ERROR = {}));