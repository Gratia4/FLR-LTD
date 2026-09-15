"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { Bell,Buildings,Clock,FileText,Package,SignOut,Storefront } from "@phosphor-icons/react";
import { AuthUser } from "@/lib/session";
const links=[{key:"dashboard",href:"/admin",label:"Applications",icon:Storefront},{key:"clients",href:"/admin/clients",label:"Clients",icon:Buildings},{key:"catalogue",href:"/admin/catalogue",label:"Catalogue",icon:Package},{key:"orders",href:"/admin/orders",label:"Orders",icon:FileText}];
export function AdminShell({user,active,onLogout,children}:{user:AuthUser|null;active:string;onLogout:()=>void;children:ReactNode}){
 if(!user)return <main className="portal-loading"><Clock size={28}/><p>Verifying staff access…</p></main>;
 return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><b>FLR</b><span>ADMIN PORTAL</span></div><nav>{links.map(item=>{const Icon=item.icon;return <Link key={item.key} className={active===item.key?"active":""} href={item.href}><Icon/>{item.label}</Link>})}</nav><button onClick={onLogout}><SignOut/>Sign out</button></aside><main className="admin-main"><header><div><span>Administration</span><h1>Good day, {user.fullName.split(" ")[0]}</h1></div><div className="admin-profile"><button aria-label="Notifications"><Bell/></button><i>{user.fullName.split(" ").map(part=>part[0]).slice(0,2).join("")}</i><span><b>{user.fullName}</b><small>{user.role.replaceAll("_"," ")}</small></span></div></header>{children}</main></div>;
}
