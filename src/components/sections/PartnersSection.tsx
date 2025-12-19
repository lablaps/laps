import Image from 'next/image';

const partners = [
  { name: 'UEMA', logo: '/images/partners/uema-logo.png', url: 'https://www.uema.br' },
  { name: 'CNPq', logo: '/images/partners/cnpq-logo.png', url: 'https://www.gov.br/cnpq' },
  { name: 'FAPEMA', logo: '/images/partners/fapema-logo.png', url: 'https://www.fapema.br' },
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nossos Parceiros</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Instituições que apoiam e colaboram com nossas pesquisas.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {/* Placeholder for logos - In a real scenario, ensure these images exist in public/images/partners */}
          {partners.map((partner) => (
            <a 
              key={partner.name} 
              href={partner.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center"
            >
              <div className="h-16 w-48 bg-muted-foreground/20 rounded flex items-center justify-center text-muted-foreground font-bold text-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {partner.name}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
