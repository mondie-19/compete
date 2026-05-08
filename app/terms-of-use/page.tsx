"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsOfUsePage() {
    return (
        <main className="min-h-screen bg-[#0B0B10] text-white pt-32 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-xs font-bold uppercase tracking-widest">
                    <ChevronLeft size={14} />
                    Back to Home
                </Link>

                <div className="mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-compete-purple mb-4">Legal</p>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">Terms of Use</h1>
                    <p className="text-white/40 text-sm">Last updated: April 2025 &nbsp;·&nbsp; Effective immediately upon account registration.</p>
                </div>

                <div className="space-y-10 text-sm text-white/70 leading-relaxed">

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">1. Acceptance</h2>
                        <p>By accessing or using the Compete platform ("Service"), you confirm that you are at least 18 years of age, have read and understood these Terms of Use, and agree to be bound by them in full. If you do not agree, you must discontinue use of the Service immediately.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">2. Eligibility</h2>
                        <p>The Service is available to individuals who are legally permitted to participate in competitive wagering activities under the laws of their jurisdiction. You are solely responsible for determining whether your use of Compete is lawful in your location. Compete reserves the right to restrict access in any jurisdiction at its discretion.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">3. Account Registration</h2>
                        <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. Compete will not be held liable for any loss resulting from unauthorized account access caused by your failure to secure your login information.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">4. Vault & Escrow System</h2>
                        <p>Compete operates an in-platform Vault system. Funds deposited into your Vault are held in escrow during active challenges and released upon verified match resolution. Compete charges a platform rake on each match payout, the current rate of which is disclosed at the time of challenge creation. Deposits and withdrawals are subject to processing times and identity verification.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">5. Match Rules & Conduct</h2>
                        <p>All participants are expected to compete with integrity. The following are strictly prohibited: use of hacks, aimbots, macros, or unauthorized software; collusion between opponents; match fixing; and any form of harassment toward other users. Violations will result in immediate account suspension and forfeiture of all associated Vault funds.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">6. Dispute Resolution</h2>
                        <p>In the event of a contested match result, the matter will be reviewed by a designated Compete moderator. The moderator's decision is final. Compete does not guarantee resolution timelines and will not be held liable for delays caused by insufficient or unclear evidence submitted by either party.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">7. Intellectual Property</h2>
                        <p>All platform assets, including but not limited to logos, interface design, codebase, and written content, are the exclusive property of Compete. Unauthorised reproduction, distribution, or modification of any platform content is prohibited. Game titles, trademarks, and associated imagery referenced on this platform remain the property of their respective rights holders. Compete is not affiliated with, endorsed by, or sponsored by any game publisher.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">8. Limitation of Liability</h2>
                        <p>Compete shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. The platform is provided on an "as is" and "as available" basis. We do not warrant that the Service will be uninterrupted, error-free, or free from security vulnerabilities.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">9. Modifications</h2>
                        <p>Compete reserves the right to modify these Terms at any time. Continued use of the Service following any update constitutes your acceptance of the revised Terms. We recommend reviewing this page periodically.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">10. Governing Law</h2>
                        <p>These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.</p>
                    </section>

                    <div className="pt-8 border-t border-white/5 text-white/30 text-xs">
                        <p>For legal inquiries, contact: <span className="text-compete-purple">legal@compete.gg</span></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
