export interface UserCreateModel {
//   @NotBlank(message = "A felhasználó név nem lehet üres")
//   private String userName;
//
//   @NotBlank(message = "A jelszó nem lehet üres")
//   private String passwordHash;
//
//   private String role;

  userName:string;
  passwordHash : string;
  role:String;
}
