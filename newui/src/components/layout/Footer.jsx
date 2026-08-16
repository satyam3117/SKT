function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-8 px-5 py-16 md:grid-cols-4 md:px-16">
        <div>
          <a href="#" className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
            SKT
          </a>
          <p className="mt-3 text-sm text-zinc-600">
            Your destination for premium PC hardware and gaming accessories.
          </p>
        </div>

        <FooterCol title="Shop" links={["Laptop & PC", "Components", "Peripherals", "CCTV Camera"]} />
        <FooterCol title="Customer Service" links={["Help & FAQs", "Track Order", "Shipping & Delivery", "Contact"]} />
        <FooterCol title="Company" links={["About Us", "Terms & Conditions", "Stores", "Marketing Cooperation"]} />
      </div>
      <div className="border-t border-zinc-200 px-5 py-6 text-center text-xs text-zinc-500 md:px-16">
        © 2026 SKT Computer Shop | All Rights Reserved
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">{title}</h4>
      {links.map((link) => (
        <a key={link} href="#" className="block text-sm text-zinc-600 transition hover:text-brand">
          {link}
        </a>
      ))}
    </div>
  );
}

export default Footer;
