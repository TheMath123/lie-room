'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const route = useRouter();
  useEffect(() => {
    route.push('/')
  }, []);
  return <div></div>
}