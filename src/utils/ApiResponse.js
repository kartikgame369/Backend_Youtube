class ApiResponse{
    constructor(statuscode,data,message="success"){
        this.statuscode=statuscode;
        this.data=data;
        this.message=message;
        this.success= statuscode<400;
    }
}

//  server having status code 1 , 2 , 3, 4 ,5 google 
//  informational responses (100–199)
//  successful responses (200–299)
//  redirection messages (300–399)
//  client error responses (400–499)
//  server error responses (500–599)
export {ApiResponse}
