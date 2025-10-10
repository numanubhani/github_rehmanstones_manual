// src/pages/ReturnPolicy.tsx

export default function ReturnPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Return & Refund Policy</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <Section title="7-Day Return Policy">
            <p>
              We want you to be completely satisfied with your purchase. If you're not
              happy, you can return most items within 7 days of delivery for a full refund
              or exchange.
            </p>
          </Section>

          <Section title="Eligible Returns">
            <p>Items must meet these conditions to be eligible for return:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Returned within 7 days of delivery</li>
              <li>In original, unworn, and unused condition</li>
              <li>Include all original tags, packaging, and certificates</li>
              <li>Not engraved or customized</li>
              <li>Accompanied by original receipt or order confirmation</li>
            </ul>
          </Section>

          <Section title="Non-Returnable Items">
            <p>The following items cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Custom-made or personalized jewelry</li>
              <li>Engraved items</li>
              <li>Items without original tags or packaging</li>
              <li>Products showing signs of wear or damage</li>
              <li>Items purchased during special clearance sales (unless defective)</li>
            </ul>
          </Section>

          <Section title="How to Initiate a Return">
            <p>To return an item:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>
                Contact our customer service within 7 days of delivery via email
                (info@rehmanstones.com) or phone (+92 300 1234567)
              </li>
              <li>Provide your order number and reason for return</li>
              <li>Wait for return authorization and shipping instructions</li>
              <li>Pack the item securely with all original packaging</li>
              <li>Ship using a trackable method (keep tracking number)</li>
            </ol>
          </Section>

          <Section title="Refund Process">
            <p>Once we receive and inspect your return:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>We will notify you of the approval or rejection</li>
              <li>Approved refunds are processed within 3-5 business days</li>
              <li>
                Refunds are issued to the original payment method (bank transfer or cash
                refund for COD orders)
              </li>
              <li>It may take additional time for your bank to process the refund</li>
            </ul>
          </Section>

          <Section title="Exchanges">
            <p>
              We gladly accept exchanges for size or product variants. The exchange process
              is the same as returns. If exchanging for a more expensive item, you'll pay
              the difference. If exchanging for a less expensive item, we'll refund the
              difference.
            </p>
          </Section>

          <Section title="Damaged or Defective Items">
            <p>
              If you receive a damaged or defective item:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Contact us immediately with photos of the damage</li>
              <li>We'll arrange free return shipping</li>
              <li>You'll receive a full refund or replacement</li>
              <li>No questions asked for manufacturing defects</li>
            </ul>
          </Section>

          <Section title="Return Shipping Costs">
            <p>
              <strong>Customer responsibility:</strong> If returning due to change of mind,
              size issues, or personal preference, you are responsible for return shipping
              costs.
            </p>
            <p className="mt-3">
              <strong>Our responsibility:</strong> If returning due to our error (wrong
              item, damaged, defective), we will provide a prepaid return label or
              reimburse your shipping costs.
            </p>
          </Section>

          <Section title="Late or Missing Refunds">
            <p>If you haven't received your refund after 7 business days:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>Check your bank account again</li>
              <li>Contact your bank or credit card company</li>
              <li>Contact us at info@rehmanstones.com</li>
            </ol>
          </Section>

          <Section title="Questions?">
            <p>
              If you have any questions about our return policy, please contact:
            </p>
            <div className="mt-3 pl-4 space-y-1 text-sm">
              <div>Email: info@rehmanstones.com</div>
              <div>Phone: +92 300 1234567</div>
              <div>WhatsApp: +92 300 1234567</div>
              <div>Hours: Monday-Friday, 9 AM - 8 PM</div>
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

