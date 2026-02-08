import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    message: string
    user?: any
}

export const authQueries = {
    // Login dengan email dan password
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            })

            if (error) {
                return {
                    success: false,
                    message: error.message,
                }
            }

            return {
                success: true,
                message: 'Login berhasil',
                user: data.user,
            }
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan saat login',
            }
        }
    },

    // Logout
    async logout(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                return {
                    success: false,
                    message: error.message,
                }
            }

            return {
                success: true,
                message: 'Logout berhasil',
            }
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan saat logout',
            }
        }
    },

    // Cek user yang sedang login
    async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            return user
        } catch (error) {
            return null
        }
    },

    // Cek session
    async getSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            return session
        } catch (error) {
            return null
        }
    },
}