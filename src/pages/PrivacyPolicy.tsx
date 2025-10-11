// src/pages/PrivacyPolicy.tsx

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <Section title="Introduction">
            <p>
              At Rehman Stones, we respect your privacy and are committed to protecting your
              personal data. This privacy policy will inform you about how we collect, use,
              and safeguard your information when you visit our website or make a purchase.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number,
                shipping address, and billing information when you place an order.
              </li>
              <li>
                <strong>Payment Information:</strong> Payment details are processed securely
                through our payment partners. We do not store complete credit/debit card
                information.
              </li>
              <li>
                <strong>Order Information:</strong> Details of products you purchase,
                transaction history, and order tracking information.
              </li>
              <li>
                <strong>Technical Information:</strong> Browser type, device information, IP
                address, and cookies for website functionality and analytics.
              </li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send promotional emails (only if you opt in)</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </Section>

          <Section title="Information Sharing">
            <p>
              We do not sell, trade, or rent your personal information to third parties.
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Shipping companies to deliver your orders</li>
              <li>Payment processors to handle transactions securely</li>
              <li>Service providers who assist us in operating our website</li>
              <li>Law enforcement or regulatory authorities when required by law</li>
            </ul>
          </Section>

          <Section title="Data Security">
            <p>
              We implement appropriate security measures to protect your personal information
              from unauthorized access, alteration, disclosure, or destruction. However, no
              method of transmission over the internet is 100% secure.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </Section>

          <Section title="Cookies">
            <p>
              Our website uses cookies to enhance your browsing experience, remember your
              preferences, and analyze website traffic. You can control cookie settings
              through your browser.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your
              rights, please contact us:
            </p>
            <div className="mt-3 pl-4 space-y-1 text-sm">
              <div>Email: info@rehmanstones.com</div>
              <div>Phone: +92 314 8426575</div>
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

