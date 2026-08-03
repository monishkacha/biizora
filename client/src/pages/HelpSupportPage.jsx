import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supportApi } from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge, Card, Skeleton } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  LifeBuoy,
  Mail,
  Clock,
  BookOpen,
  FileText,
  Video,
  MonitorSmartphone,
  ExternalLink,
  MessageSquarePlus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

const optionIcons = {
  email: Mail,
  hours: Clock,
  knowledge: BookOpen,
  docs: FileText,
  videos: Video,
};

function statusTone(status) {
  if (status === 'online') return 'success';
  if (status === 'busy') return 'warning';
  if (status === 'away') return 'info';
  return 'neutral';
}

export default function HelpSupportPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await supportApi.center();
        if (alive) setData(res);
      } catch (err) {
        if (alive) setNotice(err.message || 'Failed to load support center');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const connectAnyDesk = async (founder) => {
    setConnecting(founder.id);
    setNotice('');
    try {
      await supportApi.requestSession({
        agentId: founder.id,
        channel: 'anydesk',
        notes: 'Requested via Help & Support',
      });
      const link = founder.anydeskLink || (founder.anydeskId ? `anydesk:${founder.anydeskId.replace(/\s+/g, '')}` : '');
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
      setNotice(`Session requested with ${founder.name}. ${data?.config?.remoteNote || ''}`);
    } catch (err) {
      setNotice(err.message || 'Could not start session request');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Help & Support"
        description="Direct founder assistance, email support, and product guidance."
        actions={
          <Link to="/app/feedback">
            <Button variant="secondary" size="sm">
              Feedback Tracker <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] border border-stone bg-gradient-to-br from-white via-cream/70 to-yellow-champagne/25 p-7 sm:p-9"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-green-bottle text-white flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
                  {data?.welcome || 'Need assistance? Our founders are here to help you.'}
                </h2>
                <p className="mt-2 text-sm text-warm-gray max-w-2xl leading-relaxed">
                  Premium remote support from the people who built Biizora — schedule first, then connect securely.
                </p>
                {data?.subscriber?.isPremium ? (
                  <div className="mt-4">
                    <Badge tone="accent">Premium Support</Badge>
                    <p className="mt-2 text-xs text-warm-gray">
                      Priority review on feedback — we aim to respond within {data.subscriber.priorityResponseDays} days.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-4">Founder support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data?.founders || []).map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4">
                      <img
                        src={f.avatar}
                        alt={f.name}
                        className="w-14 h-14 rounded-[16px] border border-stone bg-cream object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-charcoal">{f.name}</h4>
                          <Badge tone={statusTone(f.status)}>{f.status}</Badge>
                        </div>
                        <p className="text-xs text-warm-gray mt-1">{f.role}</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-[14px] bg-cream/80 border border-stone px-3.5 py-2.5">
                        <span className="text-warm-gray text-xs">AnyDesk ID</span>
                        <span className="font-mono text-xs text-charcoal">{f.anydeskId || '—'}</span>
                      </div>
                      {f.email ? (
                        <p className="text-xs text-warm-gray px-1">{f.email}</p>
                      ) : null}
                    </div>

                    <div className="mt-auto pt-5">
                      <Button
                        className="w-full"
                        loading={connecting === f.id}
                        onClick={() => connectAnyDesk(f)}
                      >
                        <MonitorSmartphone className="w-4 h-4" />
                        Connect via AnyDesk
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-yellow-butter/50 bg-yellow-champagne/40 px-4 py-3.5">
              <ShieldAlert className="w-4 h-4 text-mustard shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-xs text-charcoal/80 leading-relaxed">
                {data?.config?.remoteNote ||
                  'Remote support sessions should only be initiated after prior communication through email or scheduled support.'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-4">Need help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(data?.config?.options || []).map((opt) => {
                const Icon = optionIcons[opt.id] || LifeBuoy;
                const soon = opt.status === 'coming_soon';
                const inner = (
                  <Card
                    className={`p-5 h-full ${soon ? 'opacity-80' : 'hover:border-green-sage/40 hover:shadow-elev'} transition-all duration-[220ms]`}
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-cream border border-stone flex items-center justify-center mb-3">
                      <Icon className="w-4.5 h-4.5 text-green-bottle" strokeWidth={1.75} />
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-charcoal">{opt.title}</h4>
                      {soon ? <Badge tone="neutral">Coming soon</Badge> : null}
                    </div>
                    <p className="mt-1.5 text-xs text-warm-gray leading-relaxed">{opt.description}</p>
                  </Card>
                );
                return opt.href && !soon ? (
                  <a key={opt.id} href={opt.href} className="block">
                    {inner}
                  </a>
                ) : (
                  <div key={opt.id}>{inner}</div>
                );
              })}
            </div>
          </div>

          <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-yellow-butter/60 border border-yellow-honey/40 flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5 text-charcoal" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Share product feedback</h4>
                <p className="text-xs text-warm-gray mt-1 max-w-md">
                  Suggest features, report bugs, or tell us what to improve. Track every update in Feedback Tracker.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/#feedback">
                <Button variant="accent" size="sm">
                  Submit feedback
                </Button>
              </Link>
              <Link to="/app/feedback">
                <Button variant="secondary" size="sm">
                  Open tracker
                </Button>
              </Link>
            </div>
          </Card>

          {notice ? (
            <p className="text-xs text-warm-gray bg-cream border border-stone rounded-[14px] px-4 py-3">{notice}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
