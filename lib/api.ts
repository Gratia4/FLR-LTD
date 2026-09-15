export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
type ApiErrorBody = { error?: { message?: string; code?: string } };
export class ApiRequestError extends Error {
  constructor(message:string,public status:number,public code="REQUEST_FAILED"){super(message);this.name="ApiRequestError"}
}
export async function apiRequest<T>(path:string,init?:RequestInit):Promise<T>{
  let response:Response;
  try{response=await fetch(`${API_URL}${path}`,init)}catch{throw new ApiRequestError("The FLR service is currently unreachable. Please try again shortly.",0,"NETWORK_ERROR")}
  const body=await response.json().catch(()=>({})) as ApiErrorBody&T;
  if(!response.ok)throw new ApiRequestError(body.error?.message??"Your request could not be completed.",response.status,body.error?.code);
  return body;
}
