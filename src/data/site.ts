export const brand = {
  name: 'Laurier Analytics Society',
  short: 'LAS'
};

export const navLinks = [
{ label: 'About', href: '#about' },
{ label: 'Datathon', href: '#datathon' },
{ label: 'Workshops', href: '/workshops/' },
{ label: 'Team', href: '#team' },
{ label: 'FAQ', href: '#faq' },
{ label: 'Partners', href: '#partners' }];

export const workshops = [{
  title: "API's For DATA - A Beginners Workshop",
  youtubeId: 'SN1mOhp1eck'
}];

export const workshopPage = {
  introduction: 'Practical workshops from Laurier Analytics Society. Watch, follow along, and build your confidence with data.',
  guide: [
    { title: 'Watch with a question.', description: 'Pick something you want to understand. Keep it in mind as you work through the recording.' },
    { title: 'Pause and try it.', description: 'Keep your own workspace open. Give yourself time to experiment before moving on.' },
    { title: 'Make it your own.', description: 'Change an example, explore a different idea, or note a question to bring to the LAS community.' }
  ],
  updates: 'Keep learning with LAS. Get workshop announcements, events, and practical opportunities.'
};

export function siteHref(href: string, isHome: boolean) {
  return !isHome && href.startsWith('#') ? `/${href}` : href;
}


export const aboutParagraphs = [
'The Laurier Analytics Society (LAS) is Wilfrid Laurier University\'s official analytics club. We create opportunities for students to develop real-world skills through workshops, industry mentorship, our annual datathon, and hands-on experiences, while fostering a community where students can connect, collaborate, and grow together.'];


export interface TeamMember {
  name: string;
  role: string;
  image: string;
  imagePosition?: string;
  linkedin: string;
  github?: string;
}

// linkedin: full profile URL ('' hides the icon). github: optional, omit if none.
export const team: TeamMember[] = [
{ name: 'Jana Nazer', role: 'Co-President', image: '/team/jana-nazer.jpg', imagePosition: 'center 55%', linkedin: '' },
{ name: 'Manatt Bhardwaj', role: 'Co-President', image: '/team/manatt-bhardwaj.jpg', linkedin: '' },
{ name: 'Rida Shahid', role: 'Executive Vice-President', image: '/team/rida-shahid.jpg', linkedin: '' },
{ name: 'David Zhao', role: 'VP of Technology', image: '/team/david-zhao.jpg', linkedin: 'https://www.linkedin.com/in/david-zhao-0524dz', github: 'https://github.com/zhao0524' },
{ name: 'Rohan Gottipati', role: 'VP of Technology', image: '/team/rohan-gottipati.jpg', linkedin: '' },
{ name: 'Emaad Qazi', role: 'VP of Events', image: '/team/emaad-qazi.jpg', linkedin: 'https://www.linkedin.com/in/emaadqazi', github: 'https://github.com/emaadqazi' },
{ name: 'Tharan Harikrishnan', role: 'VP of Finance', image: '/team/tharan-harikrishnan.jpg', linkedin: '' },
{ name: 'Mahnoor Ehsan', role: 'VP of Marketing', image: '/team/mahnoor-ehsan.jpg', linkedin: '' },
{ name: 'Kelly Tram', role: 'VP of Internal', image: '/team/kelly-tram.jpg', linkedin: '' },
{ name: 'Jason Noronha', role: 'Director of Technology', image: '/team/jason-noronha.jpg', linkedin: 'https://www.linkedin.com/in/jasonivannoronha' },
{ name: 'Yashika Sharma', role: 'Director of Technology', image: '/team/yashika-sharma.jpg', linkedin: 'https://www.linkedin.com/in/yashika-sharma-3a4778381' },
{ name: 'Sophia Thai', role: 'Director of Events', image: '/team/sophia-thai.jpg', linkedin: 'https://www.linkedin.com/in/sophxth', github: 'https://github.com/sophxth' },
{ name: 'Zainab Patel', role: 'Director of Finance', image: '/team/zainab-patel.jpg', linkedin: 'https://www.linkedin.com/in/zainabpatel33' },
{ name: 'Minahil Fatima', role: 'Director of Marketing', image: '/team/minahil-fatima.jpg', linkedin: 'https://www.linkedin.com/in/minahil-fatima-4201172b4' },
{ name: 'Nuthara Hettiarachchi', role: 'Director of Marketing', image: '/team/nuthara-hettiarachchi.jpg', linkedin: 'https://www.linkedin.com/in/nuthara-hettiarachchi-6405402bb' },
{ name: 'Henry Luong', role: 'Director of Internal', image: '/team/henry-luong.jpg', linkedin: 'https://www.linkedin.com/in/henryluong06' },
{ name: 'Jayden Rey Graneta', role: 'Director of Internal', image: '/team/jayden-graneta.jpg', linkedin: 'https://www.linkedin.com/in/jaydengraneta', github: 'https://github.com/jayden-graneta' },
{ name: 'Katon Fan', role: 'Director of Outreach', image: '/team/katon-fan.jpg', linkedin: 'https://www.linkedin.com/in/katon-fan' },
{ name: 'Uzair Farooque Grewal', role: 'Position TBD', image: '/team/uzair-grewal.jpg', linkedin: 'https://www.linkedin.com/in/uzair-grewal' },
{ name: 'Bruce Liu', role: 'First Year Rep', image: '/team/bruce-liu.jpg', linkedin: 'https://www.linkedin.com/in/liu-bruce' }];


export const datathonYears = [
{
  id: '2026',
  label: "'26",
  title: 'LAS Datathon @ Sun Life',
  summary:
    'Last year, our flagship brought a hundred students together for six days of building in teams. They took on a real problem with their group, then presented it at the Sun Life office in Waterloo.',
  images: [
    {
      src: '/data-minds-challenge.jpg',
      alt: 'Laurier Analytics Society members at The Data Minds Challenge'
    },
    {
      src: '/datathon-2026-stage.jpg',
      alt: 'The Data Minds Challenge stage, with Laurier Analytics Society and Sun Life'
    },
    {
      src: '/datathon-2026-trophies.jpg',
      alt: 'Trophies and medals from The Data Minds Challenge, including a Sun Life runner-up'
    }
  ]
},
{
  id: '2025',
  label: "'25",
  title: 'LAS Datathon @ Google',
  summary:
    'The year before that, we brought a hundred students into Google\'s Waterloo office to build in teams and demo what they made. They got the working sessions, a chance to present live, and a real feel for what this kind of project is like.',
  images: [
    {
      src: '/datathon-2025-stage.jpg',
      alt: 'A live demo at The Data Minds Challenge, hosted at Google\'s Waterloo office'
    },
    {
      src: '/datathon-2025-room.jpg',
      alt: 'Teams building at the LAS Datathon in Google\'s Waterloo office'
    },
    {
      src: '/datathon-2025-awards.jpg',
      alt: 'Winner and runner-up awards from the LAS Datathon at Google'
    }
  ]
}];


export const datathonTracks = [
{ title: 'Campus Ops', blurb: 'Optimize scheduling, transit and space usage with live Laurier operational data.' },
{ title: 'Markets', blurb: 'Build a signal, backtest it honestly, and defend it to a room of quants.' },
{ title: 'Social Good', blurb: 'Partner with Waterloo Region nonprofits to turn their raw records into decisions.' }];


export const faqs = [
{
  q: 'Do I need to know how to code?',
  a: 'No. About a third of our members join with zero code experience. The Analytics Bootcamp starts from a blank spreadsheet and takes you to a working Python notebook.'
},
{
  q: 'Which programs can join?',
  a: 'All of them. We draw heavily from BBA, Financial Math, Data Science, Computer Science and Economics, but every Laurier student is welcome regardless of faculty or year.'
},
{
  q: 'I’m interested in data analytics, but I don’t know where to start. Is LAS for me?',
  a: 'Definitely. That is exactly who we are built for. Start with the Analytics Bootcamp, which assumes zero background and takes you from a blank spreadsheet to your first Python notebook. From there, workshops, case nights and the datathon give you low-pressure ways to build real skills alongside people starting from the same place.'
},
{
  q: 'Are LAS events useful if I’m studying business, economics, or another field outside data science?',
  a: 'Yes. Analytics is strongest when it meets a real domain, and our members come from BBA, Economics, Financial Math and beyond. Whether you want to read markets, model policy or make sharper business decisions, you will find events and teammates that connect data to your field.'
},
{
  q: 'Can LAS help me explore careers in analytics and meet people working in the field?',
  a: 'That is a core part of what we do. Speaker nights, mentorship and partner datathons put you in front of analysts, quants and product leads from industry, and the network of alumni and peers you build here is often the fastest route to internships and full-time roles.'
}];


export const socials = [
{ label: 'Instagram', handle: '@laurier_analytics', url: 'https://www.instagram.com/laurier_analytics' },
{ label: 'LinkedIn', handle: '/company/laurier-analytics-society-las', url: 'https://www.linkedin.com/company/laurier-analytics-society-las' },
{ label: 'Newsletter', handle: 'Biweekly digest', url: '#newsletter' }];
