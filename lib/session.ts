export type AuthUser={id:string;email:string;fullName:string;role:string;businessId:string|null;businessName:string|null};
export function saveSession(accessToken:string,user:AuthUser,remember:boolean){
 const storage=remember?localStorage:sessionStorage;const other=remember?sessionStorage:localStorage;
 other.removeItem("flr_access_token");other.removeItem("flr_user");storage.setItem("flr_access_token",accessToken);storage.setItem("flr_user",JSON.stringify(user));
}
export function readSession(){
 const accessToken=localStorage.getItem("flr_access_token")??sessionStorage.getItem("flr_access_token");
 const rawUser=localStorage.getItem("flr_user")??sessionStorage.getItem("flr_user");
 if(!accessToken||!rawUser)return null;
 try{return{accessToken,user:JSON.parse(rawUser) as AuthUser}}catch{return null}
}
