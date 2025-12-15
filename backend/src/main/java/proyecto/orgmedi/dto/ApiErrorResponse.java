package proyecto.orgmedi.dto;

public class ApiErrorResponse {
    private String error;
    private String code;

    public ApiErrorResponse() {}

    public ApiErrorResponse(String error) {
        this.error = error;
    }

    public ApiErrorResponse(String error, String code) {
        this.error = error;
        this.code = code;
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}

