// src/pages/TermsConditions.tsx

export default function TermsConditions() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <Section title="Agreement to Terms">
            <p>
              By accessing and using the Rehman Stones website, you agree to be bound by
              these Terms and Conditions. If you disagree with any part of these terms,
              please do not use our website.
            </p>
          </Section>

          <Section title="Use of Website">
            <p>You agree to use this website only for lawful purposes and in a manner that does not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Infringe the rights of others</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt unauthorized access to our systems</li>
              <li>Use automated systems to scrape or collect data</li>
            </ul>
          </Section>

          <Section title="Product Information">
            <p>
              We strive to provide accurate product descriptions, images, and pricing.
              However:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Colors may vary slightly due to screen settings</li>
              <li>We reserve the right to correct pricing errors</li>
              <li>Product specifications may change without notice</li>
              <li>All gemstone certifications are provided by third parties</li>
              <li>Ring sizes may have minor manufacturing variations</li>
            </ul>
          </Section>

          <Section title="Orders and Payment">
            <p>
              When you place an order:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>You agree to provide accurate and complete information</li>
              <li>You authorize us to charge the payment method provided</li>
              <li>We reserve the right to refuse or cancel orders</li>
              <li>Order confirmation does not guarantee product availability</li>
              <li>Prices are subject to change without notice</li>
            </ul>
          </Section>

          <Section title="Authenticity Guarantee">
            <p>
              We guarantee that all our products are made from genuine 925 sterling silver
              and that gemstones come with authenticity certificates. If you receive a
              product that fails authenticity testing, we will provide a full refund.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              All content on this website, including text, images, logos, and designs, is
              the property of Rehman Stones or its licensors. You may not copy, reproduce,
              or distribute any content without our written permission.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              Rehman Stones shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Delays or failures caused by circumstances beyond our control</li>
              <li>Damages resulting from improper product use or care</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the purchase price of the product in question.
            </p>
          </Section>

          <Section title="Indemnification">
            <p>
              You agree to indemnify and hold harmless Rehman Stones from any claims,
              damages, or expenses arising from your violation of these terms or misuse of
              our website.
            </p>
          </Section>

          <Section title="Governing Law">
            <p>
              These Terms and Conditions are governed by the laws of Pakistan. Any disputes
              shall be resolved in the courts of Lahore, Pakistan.
            </p>
          </Section>

          <Section title="Changes to Terms">
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              website after changes constitutes acceptance of the new terms.
            </p>
          </Section>

          <Section title="Contact Information">
            <p>
              For questions about these Terms and Conditions, contact us:
            </p>
            <div className="mt-3 pl-4 space-y-1 text-sm">
              <div>Email: info@rehmanstones.com</div>
              <div>Phone: +92 300 1234567</div>
              <div>Address: 19-A Model Town, Lahore, Pakistan</div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

