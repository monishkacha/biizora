import React, { useState } from 'react';
import {
  Star,
  Plus,
  MessageSquare,
  Sparkles,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';

export default function SalonReviewsPage() {
  const [reviews] = useState([
    { id: 1, name: 'Ananya Sen', service: 'Premium Hair Coloring', stylist: 'Riya Sharma', rating: 5, date: '08 Aug 2026', text: 'Loved the service! The hair coloring matches my natural skin tone perfectly. Riya Sharma was exceptionally careful with my sensitive scalp.', reply: 'Thank you Ananya! See you next month for your root touch-up.' },
    { id: 2, name: 'Karan Malhotra', service: 'Beard Trim & Wash', stylist: 'Anjali', rating: 4, date: '05 Aug 2026', text: 'Good experience, neat trim. Clean salon chairs.', reply: '' },
    { id: 3, name: 'Rohan Roy', service: 'Hydrating Facial', stylist: 'Kavya', rating: 5, date: '28 Jul 2026', text: 'The facial was very relaxing. Kavya did a fantastic job.', reply: 'Glad you enjoyed it, Rohan!' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">Client Voice</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
          Reviews & Feedback
        </h1>
        <p className="text-sm text-warm-gray">Monitor client ratings, reviews, stylist performance, and send custom replies</p>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <Card key={rev.id} className="p-5 border border-stone bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/50 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-sage/20 border border-green-bottle/20 flex items-center justify-center font-bold text-green-bottle">
                  {rev.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="font-bold text-charcoal block">{rev.name}</span>
                  <span className="text-[10px] text-warm-gray">{rev.service} · Stylist: {rev.stylist}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-warm-gray font-mono">{rev.date}</span>
                <span className="flex text-mustard font-bold text-xs">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-champagne" />
                  ))}
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal leading-relaxed font-sans">{rev.text}</p>

            {/* Custom reply section */}
            {rev.reply ? (
              <div className="p-3 bg-ivory/50 rounded-xl border border-stone/60 text-xs">
                <span className="text-[10px] font-bold text-green-forest block uppercase">Salon Owner Reply</span>
                <p className="text-warm-gray mt-1 leading-relaxed">{rev.reply}</p>
              </div>
            ) : (
              <button className="flex items-center gap-1 text-[10px] font-bold text-green-bottle hover:underline uppercase">
                <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
