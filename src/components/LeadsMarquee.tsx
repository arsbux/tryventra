"use client";

import React from 'react';
import styles from './LeadsMarquee.module.css';
import { LeadsTable, Lead } from './LeadsTable';

const CSV_RAW_DATA = [
    { title: "Croyland Car Megastore", link: "croylandcarmegastore.co.uk", signal: "Mark Swindells (Managing Director) | Email: mark.swindells@croylandcarmegastore.co.uk | LinkedIn: https://uk.linkedin.com/in/mark-swindells-b9c0d1e2", insight: "Seeking marketing solutions for high volume customer attraction.", status: "Prospect" },
    { title: "Group 1 Automotive", link: "group1auto.com", signal: "Daryl Kenningham (President and CEO) | Email: dkenningham@group1auto.com | LinkedIn: https://www.linkedin.com/in/daryl-kenningham-6085521b", insight: "Improving operational efficiency and supply chain optimization.", status: "Pitching" },
    { title: "Accel", link: "accel.com", signal: "Prashanth Prakash (Founding Partner) | Email: pprakash@accel.com | LinkedIn: linkedin.com/in/prashanthprakash/", insight: "AI solutions for portfolio companies to achieve market leadership.", status: "Secured lead" },
    { title: "Disruptive Advertising", link: "disruptiveadvertising.com", signal: "Decision Maker | Email: info@disruptiveadvertising.com", insight: "Specializing in breakthrough results for authentic brands.", status: "Prospect" },
    { title: "Zunzi's + Zunzibar", link: "zunzis.com", signal: "Chris Smith (Associated with Zunzi's) | Email: chris@zunzis.com", insight: "Franchise development and multi-concept operational efficiency.", status: "Prospect" },
    { title: "Lusha", link: "lusha.com", signal: "Decision Maker | Email: support@lusha.com", insight: "B2B contact and company data platform expansion.", status: "Prospect" },
    { title: "Glean", link: "glean.com", signal: "Decision Maker | Email: sales@glean.com", insight: "Enterprise AI platform for company data grounding.", status: "Prospect" },
    { title: "Tines", link: "tines.com", signal: "Decision Maker | Email: hello@tines.com", insight: "No-code workflow automation for security and operations.", status: "Proposal sent" },
    { title: "Graphite", link: "graphite.dev", signal: "Decision Maker | Email: support@graphite.dev", insight: "AI code review platform for faster developer workflows.", status: "Prospect" },
    { title: "Anrok", link: "anrok.com", signal: "Decision Maker | Email: hello@anrok.com", insight: "Sales tax management tools for SaaS compliance automation.", status: "Prospect" },
    { title: "Service Experts", link: "serviceexperts.com", signal: "Rob Comstock (CEO) | Email: rob.comstock@serviceexperts.com", insight: "Commercial HVAC and plumbing services optimization.", status: "Closed" },
    { title: "Bark", link: "bark.com", signal: "Decision Maker | Email: support@bark.com", insight: "World's largest marketplace for local service professionals.", status: "Prospect" },
    { title: "Databricks", link: "databricks.com", signal: "Decision Maker | Email: sales@databricks.com", insight: "Data intelligence platform for enterprise AI scale.", status: "Secured lead" },
    { title: "Ninjapromo", link: "ninjapromo.com", signal: "Decision Maker | Email: info@ninjapromo.com", insight: "AI-driven digital marketing for revenue growth.", status: "Prospect" },
    { title: "Algoscale", link: "algoscale.com", signal: "Sumit Asthana (CEO) | Email: sumit.asthana@algoscale.com", insight: "Agile AI solutions and machine learning engineering.", status: "Prospect" }
];

function parseSignal(signal: string) {
    const parts = signal.split('|').map(s => s.trim());
    let contact = parts[0] || 'Decision Maker';
    let email = '';
    let socials = '';

    parts.forEach(part => {
        if (part.startsWith('Email:')) {
            email = part.replace('Email:', '').trim();
        } else if (part.startsWith('LinkedIn:')) {
            socials = part.replace('LinkedIn:', '').trim();
        }
    });

    return { contact, email, socials };
}

const MAPPED_LEADS: Lead[] = CSV_RAW_DATA.map((item, idx) => {
    const { contact, email, socials } = parseSignal(item.signal);
    return {
        id: `marquee-${idx}`,
        title: item.title,
        link: item.link,
        contact: contact,
        email: email,
        socials: socials,
        insight: item.insight,
        status: item.status,
        platform: 'Lead Scout',
        phone: ''
    };
});

export default function LeadsMarquee() {
    // Duplicate for seamless loop with unique keys
    const doubledLeads = [
        ...MAPPED_LEADS,
        ...MAPPED_LEADS.map(l => ({ ...l, id: `${l.id}-clone` }))
    ];

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Keep everything organised</h2>
            </div>

            <div className={styles.tableWrapper}>
                {/* Fixed Header using the LeadsTable component */}
                <div className={styles.stickyHeader}>
                    <LeadsTable leads={[]} readOnly={false} disableInteractions={true} />
                </div>

                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeTrack}>
                        <LeadsTable leads={doubledLeads} readOnly={false} hideHeader={true} disableInteractions={true} />
                    </div>
                </div>

                {/* Gradient Masks */}
                <div className={styles.maskTop}></div>
                <div className={styles.maskBottom}></div>
            </div>
        </section>
    );
}
