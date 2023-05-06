"use client";

import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_ANON
);

const AuthUI = () => {
    const router = useRouter();
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.push("/");
            }
        };
        checkSession();
    });

    supabase.auth.onAuthStateChange((event) => {
        if (event == "SIGNED_IN") {
            router.push("/");
        }
    });

    return (
        <div className="auth">
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="light"
                view="sign_in"
            />
        </div>
    );
};

export default AuthUI;