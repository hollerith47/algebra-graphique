import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Построение графиков функций | Algebra Graphique",
    description: "Построение и визуализация графиков математических функций y = f(x) в браузере. Поддержка тригонометрических, логарифмических и других функций.",
    keywords: ["графики функций", "математика", "визуализация", "калькулятор", "алгебра"],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className={inter.variable}>
        <body className="antialiased" suppressHydrationWarning>
        {children}
        </body>
        </html>
    );
}