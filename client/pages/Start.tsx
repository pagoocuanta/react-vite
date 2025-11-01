import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeaderBanner from "@/components/HeaderBanner";

import { useAuth } from "@/contexts/AuthContext";

export default function Start() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-white">
      <HeaderBanner />

      <main style={{ paddingTop: 'var(--header-height)' }}>
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-8 grid md:grid-cols-2 gap-12 items-center py-24">
            <div>
              <div className="inline-flex items-center gap-2 text-slate-600 text-xs border border-black/5 rounded-full px-3 py-1 bg-white">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Nieuw: Team onboarding workflows
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900">
                Mooie
                <br />
                <span className="text-indigo-900 font-extrabold">Onboarding</span>
                <br />
                Eenvoudig gemaakt
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-xl">
                Maak verbluffende onboarding-ervaringen die gebruikers vanaf dag één boeien. Schoon ontwerp ontmoet krachtige functionaliteit.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/login"><Button className="h-12 bg-indigo-900">Start gratis proef</Button></a>
                <Button variant="outline" className="h-12">Bekijk demo</Button>
              </div>
            </div>

            <Card className="p-6 rounded-2xl border shadow-md">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Welkom, Alex!</p>
                <p className="text-xs text-slate-500">Stap 2 van 5</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <Progress value={45} className="h-2 bg-transparent" />
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-emerald-500 grid place-items-center"><span className="w-2 h-2 rounded-full bg-emerald-500" /></span> Profielinstelling voltooid</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-indigo-900" /> Teamvoorkeuren in uitvoering</li>
                <li className="flex items-center gap-2 text-slate-400"><span className="w-4 h-4 rounded-full border-2 border-slate-300" /> Integratie-instelling</li>
              </ul>
            </Card>
          </div>
          <div className="absolute inset-0 -z-10 mx-auto max-w-6xl px-8">
            <div className="absolute -inset-x-6 -top-6 -bottom-6 rounded-[32px] bg-gradient-to-br from-indigo-100 to-violet-100 blur-2xl opacity-60" />
          </div>
        </section>

        {/* Stats */}
        <section className="py-12">
          <div className="mx-auto max-w-5xl px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-900">100+</div>
              <p className="text-slate-600 text-sm mt-1">Bedrijven vertrouwen ons</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-900">50+</div>
              <p className="text-slate-600 text-sm mt-1">Gebruikers on-boarded</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-900">95%</div>
              <p className="text-slate-600 text-sm mt-1">Voltooingspercentage</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-900">60%</div>
              <p className="text-slate-600 text-sm mt-1">Tijd bespaard</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-slate-50">
          <div className="mx-auto max-w-6xl px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Alles wat u nodig heeft om te slagen</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Krachtige functies verpakt in een prachtig, intuïtief interface dat uw team graag zal gebruiken.</p>
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Interactieve quizzes</h3>
                <p className="text-sm text-slate-600 mt-2">Betrek gebruikers met schone, kaart-gebaseerde quizzes die directe feedback geven en leren versterken.</p>
              </Card>
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Voortgang volgen</h3>
                <p className="text-sm text-slate-600 mt-2">Visuele voortgangsindicatoren die naadloos in de interface passen en gebruikers gemotiveerd houden.</p>
              </Card>
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Teambeheer</h3>
                <p className="text-sm text-slate-600 mt-2">Stroomlijn onboarding voor volledige teams met gecentraliseerde dashboards en rolgebaseerde toegang.</p>
              </Card>
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Slimme automatisering</h3>
                <p className="text-sm text-slate-600 mt-2">Automatiseer repetitieve taken en focus op wat belangrijk is voor geweldige ervaringen.</p>
              </Card>
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1l3 5 5 3-5 3-3 5-3-5-5-3 5-3 3-5z"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Enterprise-beveiliging</h3>
                <p className="text-sm text-slate-600 mt-2">Bankniveau beveiliging met geavanceerde gegevensbescherming en compliance.</p>
              </Card>
              <Card className="p-6">
                <div className="grid place-items-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">Aangepaste workflows</h3>
                <p className="text-sm text-slate-600 mt-2">Bouw onboarding-flows die aansluiten op unieke bedrijfsprocessen en vereisten.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Hoe het werkt</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Begin binnen enkele minuten met ons eenvoudige drie-stappenproces.</p>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-900 text-white grid place-items-center font-semibold">01</div>
                <h3 className="mt-4 font-semibold text-slate-900">Maak uw Flow</h3>
                <p className="text-sm text-slate-600 mt-2">Ontwerp aangepaste onboarding-workflows met onze visuele editor — stappen verbinden in enkele minuten.</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-900 text-white grid place-items-center font-semibold">02</div>
                <h3 className="mt-4 font-semibold text-slate-900">Voeg interactieve elementen toe</h3>
                <p className="text-sm text-slate-600 mt-2">Voeg quizzes, taken en multimedia-inhoud toe om nieuwe gebruikers effectief te begeleiden.</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-900 text-white grid place-items-center font-semibold">03</div>
                <h3 className="mt-4 font-semibold text-slate-900">Lanceren en monitoren</h3>
                <p className="text-sm text-slate-600 mt-2">Publiceer en volg de voortgang met analyses en voltooiingsinzichten.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Populair bij teams wereldwijd</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">Bekijk wat onze klanten te zeggen hebben over hun onboarding-transformatie.</p>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
                ))}</div>
                <p className="mt-3 text-slate-700">“Onboardr heeft ons wervingsproces getransformeerd. Nieuwe medewerkers zijn in hun eerste maand 40% productiever.”</p>
                <div className="mt-4 text-sm text-slate-500">
                  <div className="font-medium text-slate-900">Sarah Chen</div>
                  Hoofd People Operations bij TechFlow
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
                ))}</div>
                <p className="mt-3 text-slate-700">“Het strakke ontwerp en de intuïtieve interface maakten adoptie razendsnel binnen onze hele organisatie.”</p>
                <div className="mt-4 text-sm text-slate-500">
                  <div className="font-medium text-slate-900">Marcus Rodriguez</div>
                  Customer Success Manager bij GrowthLabs
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.87 1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
                ))}</div>
                <p className="mt-3 text-slate-700">“We hebben de onboardingtijd met 60% verminderd en tegelijkertijd de voltooiingspercentages verbeterd. De ROI is ongelooflijk.”</p>
                <div className="mt-4 text-sm text-slate-500">
                  <div className="font-medium text-slate-900">Emily Watson</div>
                  Training Director bij InnovateCorp
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-indigo-900 text-white">
          <div className="mx-auto max-w-6xl px-8">
            <h2 className="text-3xl font-bold">Klaar om uw Onboarding te transformeren?</h2>
            <p className="mt-2 text-sm/6 max-w-2xl text-white/90">Sluit u aan bij duizenden bedrijven die betere eerste indrukken creëren met Onboardr.</p>
            <div className="mt-6">
              <a href="/login">
                <Button variant="secondary" className="h-12 bg-white/10">Begin</Button>
              </a>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <span>© 2025 Onboardr. All rights reserved.</span>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" className="h-8 px-2 text-white/90 border-white/20">NL</Button>
                  <Button variant="outline" className="h-8 px-2 text-white/90 border-white/20">ENG</Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <a href="#">Privacy</a>
                <a href="#">Voorwaarden</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
