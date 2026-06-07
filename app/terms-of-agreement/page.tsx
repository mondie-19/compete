"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsOfAgreementPage() {
    return (
        <main className="min-h-screen bg-[#0B0B10] text-white pt-32 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 text-xs font-bold uppercase tracking-widest">
                    <ChevronLeft size={14} />
                    Back to Home
                </Link>

                <div className="mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-compete-purple mb-4">Legal</p>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">User Agreement</h1>
                    <p className="text-white/40 text-sm">Last updated: April 2025 &nbsp;·&nbsp; This Agreement governs your participation in competitive matches on Compete.</p>
                </div>

                <div className="space-y-10 text-sm text-white/70 leading-relaxed">

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">1. Parties</h2>
                        <p>This User Agreement ("Agreement") is entered into between you ("User") and Compete ("Platform"). By registering an account, deploying a challenge, or intercepting an active deployment, you acknowledge that you have read, understood, and agree to be bound by the terms set out in this Agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">2. Nature of the Platform</h2>
                        <p>Compete is a peer-to-peer competitive gaming platform that facilitates skill-based wagering between registered users. All stakes are placed voluntarily and the outcome of matches is determined solely by the performance of the participating players. Compete does not participate in, influence, or guarantee the outcome of any match.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">3. Financial Commitment</h2>
                        <p>When a User deploys or intercepts a challenge, the specified entry fee is immediately deducted from their Vault and held in escrow. By initiating or accepting a match, you irrevocably commit those funds to the outcome of that match. Funds in escrow cannot be withdrawn until the match is resolved through the official result submission and verification process.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">4. Result Submission</h2>
                        <p>Both participants are required to submit their match result through the official Compete result interface within the stipulated time window following match completion. Failure to submit a result may result in the match being flagged as a dispute or resolved against the non-submitting party. Compete reserves the right to apply its ghosting resolution policy in such cases.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">5. Prohibited Conduct</h2>
                        <p>You agree not to engage in any of the following:</p>
                        <ul className="list-disc ml-5 space-y-2 mt-3 text-white/60">
                            <li>Exploiting software vulnerabilities or third-party tools to gain an unfair competitive advantage</li>
                            <li>Submitting fraudulent or manipulated match evidence</li>
                            <li>Creating multiple accounts to circumvent bans, exploit promotions, or manipulate match outcomes</li>
                            <li>Engaging in verbal abuse, threats, or harassment of any nature toward fellow competitors</li>
                            <li>Any coordinated effort to manipulate match outcomes between opposing players (collusion)</li>
                        </ul>
                        <p className="mt-3">Violations will result in permanent account termination and forfeiture of any remaining Vault balance, with no right of appeal.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">6. Platform Rake</h2>
                        <p>Compete deducts a platform service fee (rake) from each match payout, applied at the point of winner disbursement. The rake rate is displayed in the challenge creation interface and is subject to change with advance notice. By initiating a challenge, you accept the applicable rake at the time of deployment.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">7. Moderator Authority</h2>
                        <p>In challenged or disputed matches, a Compete moderator will review all submitted evidence and deliver a binding decision. Moderators may request additional information from either party. All moderation decisions are final and non-negotiable. Compete retains the right to resolve disputes using any available evidence, including platform logs.|</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">8. Account Suspension & Termination</h2>
                        <p>Compete reserves the right to suspend or permanently terminate any account found to be in violation of this Agreement or the Terms of Use, at its sole discretion. Suspended accounts will have their Vault balance frozen pending investigation. Compete is not obligated to restore frozen balances in the event of a confirmed violation.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">9. Amendments</h2>
                        <p>Compete may update this Agreement at any time. Material changes will be communicated via the platform or registered email. Continued use of the Service after the effective date of any amendment constitutes your acceptance of the revised Agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-base font-bold uppercase tracking-widest mb-3">10. Acknowledgement</h2>
                        <p>You acknowledge that competitive wagering carries inherent financial risk. Compete does not guarantee winnings, and all participation is at your own risk. You confirm that the funds you use on this platform are lawfully obtained and that your participation is voluntary and fully informed.</p>
                    </section>

                    <div className="pt-8 border-t border-white/5 text-white/30 text-xs">
                        <p>For legal inquiries, contact: <span className="text-compete-purple">competehq@gmail.com</span></p>
                    </div>
                </div>
            </div>
        </main>
    );
}
