"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser,readSession } from "./session";
const allowedRoles=["SUPER_ADMIN","SALES_MANAGER"];
export function useAdminSession(){
 const router=useRouter();const[user,setUser]=useState<AuthUser|null>(null);const[token,setToken]=useState("");
 useEffect(()=>{const session=readSession();if(!session||!allowedRoles.includes(session.user.role)){router.replace("/login");return}setUser(session.user);setToken(session.accessToken)},[router]);
 function logout(){localStorage.removeItem("flr_access_token");localStorage.removeItem("flr_user");sessionStorage.removeItem("flr_access_token");sessionStorage.removeItem("flr_user");router.replace("/login")}
 return{user,token,logout};
}
