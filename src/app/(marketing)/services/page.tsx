import Link from "next/link";
import { appConfig } from "@/config/app";

export const metadata = {
  title: `${appConfig.name} — Pour les prestataires de services`,
  description:
    "Collectez des avis profilés sur vos prestations - secteur du client, taille d'entreprise, type de besoin. Vos futurs clients lisent des retours de gens qui leur ressemblent.",
};

export default function ServicesPage() {
  return (
    <div className="rw-services">
      <style>{`
        .rw-services{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a18;background:white;font-size:14px;line-height:1.6}
        .rw-services .wrap{max-width:780px;margin:0 auto;padding:0 2rem}
        .rw-services .hero{padding:2rem 0 1.5rem}
        .rw-services .hero-tag{display:inline-block;font-size:11px;font-weight:500;color:#1D9E75;background:#E1F5EE;padding:3px 10px;border-radius:20px;margin-bottom:.75rem;letter-spacing:.02em}
        .rw-services h1{font-size:38px;font-weight:500;line-height:1.2;margin-bottom:.75rem;letter-spacing:-.02em;max-width:600px}
        .rw-services h1 span{color:#1D9E75}
        .rw-services .hero-sub{font-size:16px;color:#5F5E5A;line-height:1.7;max-width:520px;margin-bottom:1.25rem}
        .rw-services .hero-sub strong{color:#1a1a18;font-weight:500}
        .rw-services .cta-primary{display:inline-block;background:#1a1a18;color:white;font-size:13px;font-weight:500;padding:9px 20px;border-radius:8px;cursor:pointer;text-decoration:none}
        .rw-services .cta-note{display:block;font-size:12px;color:#B4B2A9;margin-top:4px;margin-bottom:0}
        .rw-services hr{border:none;border-top:0.5px solid #F1EFE8;margin:1.25rem 0}
        .rw-services .what-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:#B4B2A9;margin-bottom:1rem}
        .rw-services .points-grid{display:grid;grid-template-columns:1fr 1fr;gap:0}
        .rw-services .point{display:flex;gap:12px;padding:1rem;border-bottom:0.5px solid #F1EFE8;align-items:flex-start}
        .rw-services .point:nth-child(odd){border-right:0.5px solid #F1EFE8}
        .rw-services .point:nth-last-child(-n+2){border-bottom:none}
        .rw-services .point-icon{flex-shrink:0;margin-top:2px}
        .rw-services .point-title{font-size:16px;font-weight:600;color:#1a1a18;margin-bottom:4px}
        .rw-services .point-desc{font-size:13px;color:#5F5E5A;line-height:1.6}
        .rw-services .beta{background:#1a1a18;border-radius:14px;padding:2.5rem;margin:2rem 0}
        .rw-services .beta-tag{display:inline-block;font-size:11px;font-weight:600;color:white;background:#1D9E75;padding:3px 10px;border-radius:20px;margin-bottom:1rem}
        .rw-services .beta h2{font-size:22px;font-weight:500;color:white;margin-bottom:.5rem;line-height:1.3;max-width:480px}
        .rw-services .beta-sub{font-size:13px;color:#888780;line-height:1.65;margin-bottom:1.5rem;max-width:480px}
        .rw-services .beta-body{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start}
        .rw-services .av{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:#D3D1C7;margin-bottom:8px;line-height:1.45}
        .rw-services .av-dot{color:#1D9E75;flex-shrink:0;font-size:16px;line-height:1;margin-top:1px}
        .rw-services .places{background:#2C2C2A;border-radius:8px;padding:10px 14px;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between}
        .rw-services .places-lbl{font-size:12px;color:#888780}
        .rw-services .places-val{font-size:13px;font-weight:600;color:#5DCAA5}
        .rw-services .form{display:flex;gap:8px;margin-bottom:8px}
        .rw-services .form input{flex:1;background:#2C2C2A;border:0.5px solid #3C3C3A;border-radius:8px;padding:11px 13px;font-size:13px;color:white;outline:none}
        .rw-services .form input::placeholder{color:#5F5E5A}
        .rw-services .form input:focus{border-color:#1D9E75}
        .rw-services .form-btn{background:#1D9E75;color:white;font-size:13px;font-weight:600;padding:11px 18px;border-radius:8px;white-space:nowrap;cursor:pointer;flex-shrink:0;border:none}
        .rw-services .form-note{font-size:11px;color:#888780}
        .rw-services .founder{padding:1.5rem 0;border-top:0.5px solid #F1EFE8}
        .rw-services .founder-inner{display:flex;gap:14px;align-items:flex-start;max-width:600px}
        .rw-services .founder-avatar{width:36px;height:36px;border-radius:50%;background:#1a1a18;color:white;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .rw-services .founder-name{font-size:12px;font-weight:600;color:#1a1a18}
        .rw-services .founder-role{font-size:11px;color:#B4B2A9;margin-bottom:6px}
        .rw-services .founder-quote{font-size:13px;color:#5F5E5A;line-height:1.65;font-style:italic;border-left:2px solid #E1F5EE;padding-left:10px}
        .rw-services .faq{padding:1.5rem 0;border-top:0.5px solid #F1EFE8}
        .rw-services .faq-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:#B4B2A9;margin-bottom:1.25rem}
        .rw-services .faq-item{margin-bottom:1.25rem}
        .rw-services .faq-item:last-child{margin-bottom:0}
        .rw-services .faq-q{font-size:13px;font-weight:600;color:#1a1a18;margin-bottom:4px}
        .rw-services .faq-a{font-size:13px;color:#5F5E5A;line-height:1.65}
        @media(max-width:620px){
          .rw-services .wrap{padding:0 1.25rem}
          .rw-services h1{font-size:26px}
          .rw-services .hero{padding:1.5rem 0 1rem}
          .rw-services .points-grid{grid-template-columns:1fr}
          .rw-services .point{border-right:none !important}
          .rw-services .point:nth-last-child(-n+2){border-bottom:0.5px solid #F1EFE8}
          .rw-services .point:last-child{border-bottom:none}
          .rw-services .beta{padding:1.5rem}
          .rw-services .beta-body{grid-template-columns:1fr}
          .rw-services .form{flex-direction:column}
        }
      `}</style>

      <div className="wrap">

        {/* HERO */}
        <div className="hero">
          <div className="hero-tag">Pour les prestataires de services</div>
          <h1>La preuve sociale qui convertit -<br /><span>vos clients le méritent</span></h1>
          <p className="hero-sub">ReviewWall collecte des avis profilés sur vos prestations - <strong>secteur du client, taille d&apos;entreprise, type de besoin.</strong> Vos futurs clients lisent des retours de gens qui leur ressemblent.</p>
          <Link className="cta-primary" href="/register">Rejoindre la beta gratuite →</Link>
          <span className="cta-note">Sans carte bancaire · 7 places restantes sur 10</span>
        </div>

        <hr />

        {/* CE QUE C'EST */}
        <div className="what-label">Ce que vous obtenez</div>
        <div className="points-grid">

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#E1F5EE"/>
                <circle cx="20" cy="16" r="5" fill="#1D9E75"/>
                <rect x="11" y="24" width="18" height="2.5" rx="1.25" fill="#5DCAA5"/>
                <rect x="13" y="28.5" width="14" height="2.5" rx="1.25" fill="#5DCAA5"/>
                <circle cx="28" cy="26" r="5" fill="#085041"/>
                <path d="M26 26h4M28 24v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Avis profilés</div>
              <div className="point-desc">Chaque avis affiche le profil du client - secteur, taille, type de besoin. Vos prospects lisent des retours de clients qui leur ressemblent.</div>
            </div>
          </div>

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#E1F5EE"/>
                <rect x="9" y="12" width="22" height="14" rx="3" fill="#1D9E75"/>
                <rect x="12" y="15" width="16" height="8" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="14" y="17" width="6" height="1.5" rx="0.75" fill="#1D9E75"/>
                <rect x="14" y="20" width="9" height="1.5" rx="0.75" fill="#5DCAA5"/>
                <rect x="17" y="26" width="6" height="2" rx="1" fill="#085041"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Widget intelligent</div>
              <div className="point-desc">Remonte automatiquement sur votre site les avis les plus pertinents pour chaque visiteur.</div>
            </div>
          </div>

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#E1F5EE"/>
                <rect x="10" y="10" width="20" height="14" rx="3" fill="#1D9E75"/>
                <rect x="13" y="13.5" width="9" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
                <rect x="13" y="16.5" width="6" height="1.5" rx="0.75" fill="white" opacity="0.5"/>
                <path d="M26 17.5L30 17.5" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M29 15.5L31 17.5L29 19.5" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="10" y="27" width="20" height="5" rx="2.5" fill="#9FE1CB"/>
                <rect x="13" y="28.75" width="8" height="1.5" rx="0.75" fill="#085041"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Collecte automatique</div>
              <div className="point-desc">Importez vos clients par CSV. Relances automatiques après chaque mission. Lien unique par email, réponse en 2 minutes.</div>
            </div>
          </div>

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#E1F5EE"/>
                <rect x="10" y="10" width="20" height="20" rx="3" fill="#1D9E75"/>
                <rect x="13" y="14" width="14" height="2" rx="1" fill="white" opacity="0.9"/>
                <rect x="13" y="18" width="10" height="2" rx="1" fill="white" opacity="0.6"/>
                <rect x="13" y="22" width="12" height="2" rx="1" fill="white" opacity="0.6"/>
                <circle cx="29" cy="27" r="6" fill="#085041"/>
                <path d="M27 27l1.5 1.5L31 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Questions validées par l&apos;IA</div>
              <div className="point-desc">Ajoutez vos questions de satisfaction. L&apos;IA détecte les biais et problèmes RGPD avant publication. Remplace votre enquête post-mission.</div>
            </div>
          </div>

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#E1F5EE"/>
                <rect x="10" y="9" width="20" height="13" rx="2" fill="#9FE1CB"/>
                <rect x="13" y="12" width="14" height="2" rx="1" fill="#085041"/>
                <rect x="13" y="16" width="9" height="2" rx="1" fill="#0F6E56"/>
                <rect x="10" y="24" width="20" height="7" rx="2" fill="#1D9E75"/>
                <rect x="13" y="27" width="8" height="1.5" rx="0.75" fill="white" opacity="0.7"/>
                <path d="M24 27h4M26 25v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Dashboard client</div>
              <div className="point-desc">Note moyenne, répartition par type de mission, insights par secteur client. Adaptez votre offre à ce que vos meilleurs clients ont en commun.</div>
            </div>
          </div>

          <div className="point">
            <div className="point-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#F1EFE8"/>
                <circle cx="20" cy="20" r="10" fill="white" stroke="#D3D1C7" strokeWidth="1"/>
                <path d="M20 10C15 10 11 14 11 20" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 10C25 10 29 14 29 20" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 20C11 26 15 30 20 30" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round"/>
                <path d="M29 20C29 26 25 30 20 30" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="4" fill="#4285F4"/>
                <path d="M19 20l1.5 1.5L23 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="point-title">Boost Google inclus</div>
              <div className="point-desc">Après son avis ReviewWall, votre client peut le partager sur Google Maps en 30 secondes - texte copié automatiquement.</div>
            </div>
          </div>

        </div>

        {/* BETA */}
        <div className="beta">
          <div className="beta-tag">Beta - places limitées</div>
          <h2>Co-construisez ReviewWall - 18 mois de plan Pro offerts</h2>
          <p className="beta-sub">Le produit est opérationnel. Plutôt que de figer des prix sans retour terrain, nous construisons l&apos;offre avec les 10 premiers prestataires partenaires.</p>
          <div className="beta-body">
            <div className="avantages">
              <div className="av"><span className="av-dot">✦</span>18 mois de plan Pro offerts (valeur indicative 702 €)</div>
              <div className="av"><span className="av-dot">✦</span>Tarif préférentiel garanti à l&apos;issue de la beta</div>
              <div className="av"><span className="av-dot">✦</span>Voix directe sur le développement produit</div>
            </div>
            <div>
              <div className="places">
                <span className="places-lbl">Places disponibles sur 10</span>
                <span className="places-val">10 restantes</span>
              </div>
              <form action="/register" className="form">
                <input type="email" name="email" placeholder="votre@email.com" />
                <button type="submit" className="form-btn">Je candidate →</button>
              </form>
              <div className="form-note">Sans engagement · Sans carte bancaire · Réponse sous 24h</div>
            </div>
          </div>
        </div>

        {/* FONDATEUR */}
        <div className="founder">
          <div className="founder-inner">
            <div className="founder-avatar">D</div>
            <div>
              <div className="founder-name">David - Fondateur ReviewWall</div>
              <div className="founder-role">Développeur indépendant · Hauts-de-France</div>
              <div className="founder-quote">&ldquo;Je construis ReviewWall pour les prestataires qui perdent des clients face au manque d&apos;avis vérifiés sur leurs missions. Parce qu&apos;il est très difficile pour un prospect de savoir si une offre est adaptée à sa situation - malgré les témoignages. Un avis sans contexte client ne répond pas à la vraie question : est-ce que ça marche pour quelqu&apos;un comme moi ?&rdquo;</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq">
          <div className="faq-label">Questions fréquentes</div>

          <div className="faq-item">
            <div className="faq-q">Quelle différence avec Google Avis ?</div>
            <div className="faq-a">Google note les entreprises. ReviewWall note les prestations - chaque avis est attaché à une prestation précise et affiche le profil du client : secteur, taille, type de besoin.</div>
          </div>

          <div className="faq-item">
            <div className="faq-q">Pour quels types de prestataires ?</div>
            <div className="faq-a">Agences, consultants, freelances, artisans, cabinets - tout prestataire dont les clients ont des profils variés et dont la valeur dépend du contexte. Un avis d&apos;un grand groupe ne dit rien à une PME, et vice versa.</div>
          </div>

          <div className="faq-item">
            <div className="faq-q">Et si je reçois un avis négatif ?</div>
            <div className="faq-a">Vous ne pouvez pas le supprimer - et c&apos;est ce qui rend vos avis positifs crédibles. Chaque avis est lu avec le profil du client. Vous avez un droit de réponse publique illimité. C&apos;est la norme de Booking, Amazon, Tripadvisor.</div>
          </div>

          <div className="faq-item">
            <div className="faq-q">En combien de temps j&apos;ai mes premiers avis ?</div>
            <div className="faq-a">Dès votre première mission terminée - vous importez votre liste de clients, ils reçoivent un lien unique par email et répondent en 2 minutes sans inscription.</div>
          </div>

          <div className="faq-item">
            <div className="faq-q">Le produit existe déjà ?</div>
            <div className="faq-a">Oui - ReviewWall est opérationnel sur la plupart des fonctionnalités présentées. Les prestataires qui rejoignent la beta maintenant co-construisent les derniers arbitrages et obtiennent 18 mois de plan Pro offerts en échange de leur retour.</div>
          </div>
        </div>

      </div>
    </div>
  );
}
