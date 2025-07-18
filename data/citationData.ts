export const CITATION_STYLES = [
  "APA (American Psychological Association)",
  "MLA (Modern Language Association)",
  "Chicago Manual of Style (CMOS)",
  "Harvard Referencing Style",
  "IEEE (Institute of Electrical and Electronics Engineers)",
  "AMA (American Medical Association)",
  "ACS (American Chemical Society)",
  "ASA (American Sociological Association)",
  "Bluebook",
  "OSCOLA (Oxford University Standard for Citation of Legal Authorities)",
  "CSE (Council of Science Editors)",
  "Vancouver",
  "Turabian",
  "Oxford",
  "AAA (American Anthropological Association)",
  "APSA (American Political Science Association)",
];

export const SOURCE_TYPE_CATEGORIES = {
  "Books": ["Whole book", "Chapter in an edited book", "E-book"],
  "Journals": ["Journal article (print or online)", "Preprint"],
  "Websites/Online Sources": ["Web page", "Blog post", "Online image/figure/table", "Online video (e.g., YouTube)", "Social media post", "Podcast", "Online forum/discussion board"],
  "Reports & Grey Literature": ["Report", "Conference paper/proceeding", "Thesis/Dissertation", "White paper", "Press release", "Pamphlet/Brochure"],
  "Audiovisual & Multimedia": ["Film/Movie", "TV show/episode", "Music recording", "Artwork/Image (physical)", "Lecture/Presentation (recorded)"],
  "Interviews & Personal Communications": ["Personal interview", "Email", "Letter", "Telephone conversation"],
  "Government & Legal Documents": ["Act of Parliament/Statute", "Case law/Court case", "Bill", "Regulation", "Parliamentary debate (Hansard)", "Treaty"],
  "Newspapers & Magazines": ["Newspaper article (print or online)", "Magazine article (print or online)"],
  "Unpublished & Archival Materials": ["Manuscript", "Archival collection/document", "Lecture notes (unpublished)", "Internal company document"],
  "Other": ["Standard", "Patent", "Map", "Software/Code", "Data set"],
};

interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'number' | 'date';
}

const commonFields = {
    authors: { name: 'authors', label: 'Author(s)', placeholder: 'e.g., Smith, J. D., & Jones, M. K.' },
    title: { name: 'title', label: 'Title', placeholder: 'Title of the work' },
    year: { name: 'year', label: 'Publication Year', placeholder: 'e.g., 2023', type: 'number' as const },
    url: { name: 'url', label: 'URL', placeholder: 'https://...' },
    doi: { name: 'doi', label: 'DOI', placeholder: 'Digital Object Identifier' },
    accessedDate: { name: 'accessedDate', label: 'Date Accessed', placeholder: 'e.g., 2023-10-27', type: 'date' as const },
};

export const SOURCE_FIELDS: Record<string, FormField[]> = {
  // Books
  "Whole book": [commonFields.authors, commonFields.title, commonFields.year, { name: 'publisher', label: 'Publisher', placeholder: 'e.g., Academic Press' }, { name: 'city', label: 'Publication City', placeholder: 'e.g., New York' }],
  "Chapter in an edited book": [commonFields.authors, { name: 'chapterTitle', label: 'Chapter Title', placeholder: 'Title of the chapter' }, { name: 'editors', label: 'Editor(s)', placeholder: 'e.g., Williams, S. T.' }, { name: 'bookTitle', label: 'Book Title', placeholder: 'Title of the book' }, { name: 'pages', label: 'Page Range', placeholder: 'e.g., 123-145' }, commonFields.year, { name: 'publisher', label: 'Publisher', placeholder: 'e.g., Academic Press' }],
  "E-book": [commonFields.authors, commonFields.title, commonFields.year, { name: 'publisher', label: 'Publisher', placeholder: 'e.g., Academic Press' }, commonFields.url, commonFields.doi],

  // Journals
  "Journal article (print or online)": [commonFields.authors, { name: 'articleTitle', label: 'Article Title', placeholder: 'Title of the article' }, { name: 'journalName', label: 'Journal Name', placeholder: 'e.g., Nature' }, commonFields.year, { name: 'volume', label: 'Volume', placeholder: 'e.g., 58' }, { name: 'issue', label: 'Issue', placeholder: 'e.g., 4' }, { name: 'pages', label: 'Page Range', placeholder: 'e.g., 123-145' }, commonFields.url, commonFields.doi],
  "Preprint": [commonFields.authors, commonFields.title, { name: 'repository', label: 'Repository', placeholder: 'e.g., arXiv, bioRxiv' }, { name: 'version', label: 'Version', placeholder: 'e.g., v2' }, commonFields.year, commonFields.url, commonFields.doi],

  // Websites/Online Sources
  "Web page": [commonFields.authors, { name: 'pageTitle', label: 'Page Title', placeholder: 'Title of the page' }, { name: 'siteName', label: 'Website Name', placeholder: 'e.g., Wikipedia' }, commonFields.year, commonFields.url, commonFields.accessedDate],
  "Blog post": [commonFields.authors, { name: 'postTitle', label: 'Post Title', placeholder: 'Title of the blog post' }, { name: 'blogName', label: 'Blog Name', placeholder: 'e.g., TechCrunch' }, commonFields.year, commonFields.url, commonFields.accessedDate],
  "Online image/figure/table": [commonFields.authors, commonFields.title, { name: 'description', label: 'Description', placeholder: 'e.g., Figure 1. Market trends' }, { name: 'siteName', label: 'Website Name', placeholder: 'Name of the website' }, commonFields.year, commonFields.url, commonFields.accessedDate],
  "Online video (e.g., YouTube)": [{ name: 'creator', label: 'Creator/Uploader', placeholder: 'e.g., Khan Academy' }, { name: 'videoTitle', label: 'Video Title', placeholder: 'Title of the video' }, { name: 'platform', label: 'Platform', placeholder: 'e.g., YouTube, Vimeo' }, commonFields.year, commonFields.url],
  "Social media post": [{ name: 'authorHandle', label: 'Author/Handle', placeholder: 'e.g., @nasa' }, { name: 'postText', label: 'Post Text (first 20 words)', placeholder: 'Start of the post...' }, { name: 'platform', label: 'Platform', placeholder: 'e.g., Twitter, Instagram' }, { name: 'postDate', label: 'Date of Post', placeholder: '', type: 'date' as const }, commonFields.url],
  "Podcast": [{ name: 'host', label: 'Host(s)', placeholder: 'e.g., Ira Glass' }, { name: 'episodeTitle', label: 'Episode Title', placeholder: 'Title of the episode' }, { name: 'podcastTitle', label: 'Podcast Series Title', placeholder: 'e.g., This American Life' }, { name: 'episodeNumber', label: 'Episode Number', placeholder: 'e.g., 785' }, { name: 'publicationDate', label: 'Date', placeholder: '', type: 'date' as const }, commonFields.url],
  "Online forum/discussion board": [{ name: 'authorUsername', label: 'Author Username', placeholder: 'e.g., User123' }, { name: 'postTitle', label: 'Post Title/Thread', placeholder: 'Title of the thread' }, { name: 'forumName', label: 'Forum Name', placeholder: 'e.g., Stack Overflow' }, { name: 'postDate', label: 'Date of Post', placeholder: '', type: 'date' as const }, commonFields.url],
  
  // Reports & Grey Literature
  "Report": [commonFields.authors, commonFields.title, { name: 'reportNumber', label: 'Report Number', placeholder: 'e.g., DOT/FAA/TC-21/5' }, { name: 'institution', label: 'Institution/Organization', placeholder: 'e.g., World Health Organization' }, commonFields.year, commonFields.url],
  "Conference paper/proceeding": [commonFields.authors, { name: 'paperTitle', label: 'Paper Title', placeholder: 'Title of the paper' }, { name: 'conferenceName', label: 'Conference Name', placeholder: 'Name of the conference' }, { name: 'conferenceLocation', label: 'Location', placeholder: 'e.g., San Francisco, CA' }, commonFields.year, commonFields.url],
  "Thesis/Dissertation": [commonFields.authors, commonFields.title, { name: 'degree', label: 'Degree', placeholder: 'e.g., PhD dissertation, Master\'s thesis' }, { name: 'institution', label: 'University', placeholder: 'e.g., University of Cambridge' }, commonFields.year, commonFields.url],
  "White paper": [commonFields.authors, commonFields.title, { name: 'organization', label: 'Organization', placeholder: 'Name of the company/org' }, commonFields.year, commonFields.url],
  "Press release": [{ name: 'organization', label: 'Organization', placeholder: 'Name of the company/org' }, commonFields.title, { name: 'releaseDate', label: 'Date of Release', placeholder: '', type: 'date' as const }, commonFields.url],
  "Pamphlet/Brochure": [commonFields.authors, commonFields.title, { name: 'organization', label: 'Publishing Organization', placeholder: 'e.g., American Heart Association' }, commonFields.year, { name: 'location', label: 'Location', placeholder: 'e.g., Dallas, TX' }],

  // Audiovisual & Multimedia
  "Film/Movie": [{ name: 'director', label: 'Director(s)', placeholder: 'e.g., Christopher Nolan' }, commonFields.title, { name: 'studio', label: 'Production Company', placeholder: 'e.g., Warner Bros.' }, commonFields.year],
  "TV show/episode": [{ name: 'episodeTitle', label: 'Episode Title', placeholder: 'e.g., The One with the Embryos' }, { name: 'seriesTitle', label: 'Series Title', placeholder: 'e.g., Friends' }, { name: 'season', label: 'Season', placeholder: 'e.g., 4' }, { name: 'episode', label: 'Episode', placeholder: 'e.g., 12' }, { name: 'network', label: 'Original Network', placeholder: 'e.g., NBC' }, { name: 'airDate', label: 'Original Air Date', placeholder: '', type: 'date' as const }],
  "Music recording": [{ name: 'artist', label: 'Artist(s)', placeholder: 'e.g., The Beatles' }, { name: 'songTitle', label: 'Song Title', placeholder: 'e.g., Let It Be' }, { name: 'albumTitle', label: 'Album Title', placeholder: 'e.g., Let It Be' }, { name: 'recordLabel', label: 'Record Label', placeholder: 'e.g., Apple Records' }, commonFields.year],
  "Artwork/Image (physical)": [{ name: 'artist', label: 'Artist', placeholder: 'e.g., Vincent van Gogh' }, commonFields.title, commonFields.year, { name: 'medium', label: 'Medium', placeholder: 'e.g., Oil on canvas' }, { name: 'location', label: 'Museum/Location', placeholder: 'e.g., Museum of Modern Art, New York' }],
  "Lecture/Presentation (recorded)": [{ name: 'speaker', label: 'Speaker', placeholder: 'e.g., Jane Goodall' }, { name: 'lectureTitle', label: 'Lecture Title', placeholder: 'Title of lecture' }, { name: 'eventName', label: 'Event/Conference Name', placeholder: 'e.g., TED2022' }, { name: 'eventDate', label: 'Date of Event', placeholder: '', type: 'date' as const }, commonFields.url],
  
  // Interviews & Personal Communications
  "Personal interview": [{ name: 'interviewee', label: 'Interviewee Name', placeholder: 'Name of person interviewed' }, { name: 'interviewer', label: 'Interviewer Name', placeholder: '(Optional) Your name' }, { name: 'interviewDate', label: 'Date of Interview', placeholder: '', type: 'date' as const }, { name: 'interviewType', label: 'Type', placeholder: 'e.g., Personal interview' }],
  "Email": [{ name: 'sender', label: 'Sender Name', placeholder: 'Name of sender' }, { name: 'subject', label: 'Subject of Email', placeholder: 'Subject line' }, { name: 'recipient', label: 'Recipient Name', placeholder: '(Optional) Your name' }, { name: 'emailDate', label: 'Date of Email', placeholder: '', type: 'date' as const }],
  "Letter": [{ name: 'sender', label: 'Sender Name', placeholder: 'Name of sender' }, { name: 'recipient', label: 'Recipient Name', placeholder: 'Name of recipient' }, { name: 'letterDate', label: 'Date of Letter', placeholder: '', type: 'date' as const }, { name: 'location', label: 'Location of archive (if any)', placeholder: 'e.g., Author\'s personal collection' }],
  "Telephone conversation": [{ name: 'participant1', label: 'Conversation Participant', placeholder: 'Name of person spoken to' }, { name: 'participant2', label: 'Other Participant', placeholder: '(Optional) Your name' }, { name: 'conversationDate', label: 'Date of Conversation', placeholder: '', type: 'date' as const }],
  
  // Government & Legal Documents
  "Act of Parliament/Statute": [commonFields.title, { name: 'code', label: 'Code/Statute Abbreviation', placeholder: 'e.g., U.S.C., S.C.' }, { name: 'section', label: 'Section Number(s)', placeholder: 'e.g., § 101' }, commonFields.year, commonFields.url],
  "Case law/Court case": [{ name: 'caseName', label: 'Case Name', placeholder: 'e.g., Brown v. Board of Education' }, { name: 'reporter', label: 'Reporter/Volume', placeholder: 'e.g., 347 U.S. 483' }, { name: 'court', label: 'Court', placeholder: 'e.g., Supreme Court' }, commonFields.year, commonFields.url],
  "Bill": [{ name: 'billTitle', label: 'Bill Title', placeholder: 'Official title of the bill' }, { name: 'billNumber', label: 'Bill Number', placeholder: 'e.g., H.R. 1' }, { name: 'legislature', label: 'Legislature/Congress', placeholder: 'e.g., 117th Congress' }, { name: 'session', label: 'Session', placeholder: 'e.g., 1st Session' }, commonFields.year, commonFields.url],
  "Regulation": [commonFields.title, { name: 'code', label: 'Code/Volume', placeholder: 'e.g., C.F.R.' }, { name: 'section', label: 'Section Number', placeholder: 'e.g., § 270.1' }, commonFields.year, commonFields.url],
  "Parliamentary debate (Hansard)": [{ name: 'speaker', label: 'Speaker', placeholder: 'Name of speaker' }, { name: 'debateTitle', label: 'Debate Title', placeholder: 'Topic of debate' }, { name: 'house', label: 'House', placeholder: 'e.g., HC Deb, HL Deb' }, { name: 'date', label: 'Date', placeholder: '', type: 'date' as const }, { name: 'column', label: 'Column Number(s)', placeholder: 'e.g., c123' }, commonFields.url],
  "Treaty": [commonFields.title, { name: 'parties', label: 'Parties', placeholder: 'e.g., United States-United Kingdom' }, { name: 'signingDate', label: 'Date Signed', placeholder: '', type: 'date' as const }, { name: 'treatySeries', label: 'Treaty Series', placeholder: 'e.g., T.I.A.S. No. 12345' }, commonFields.url],

  // Newspapers & Magazines
  "Newspaper article (print or online)": [commonFields.authors, { name: 'headline', label: 'Headline', placeholder: 'Title of the article' }, { name: 'newspaperName', label: 'Newspaper Name', placeholder: 'e.g., The New York Times' }, { name: 'publicationDate', label: 'Publication Date', placeholder: '', type: 'date' as const }, { name: 'pages', label: 'Page(s)', placeholder: 'e.g., A1, B2-B4' }, commonFields.url],
  "Magazine article (print or online)": [commonFields.authors, { name: 'articleTitle', label: 'Article Title', placeholder: 'Title of the article' }, { name: 'magazineName', label: 'Magazine Name', placeholder: 'e.g., The New Yorker' }, { name: 'publicationDate', label: 'Publication Date', placeholder: '', type: 'date' as const }, { name: 'pages', label: 'Page(s)', placeholder: 'e.g., 34-40' }, commonFields.url],
  
  // Unpublished & Archival Materials
  "Manuscript": [commonFields.authors, commonFields.title, { name: 'materialType', label: 'Type of Material', placeholder: 'e.g., Manuscript, Typescript' }, { name: 'manuscriptDate', label: 'Date', placeholder: 'circa 1920' }, { name: 'collection', label: 'Collection Name', placeholder: 'Name of the collection' }, { name: 'repository', label: 'Repository', placeholder: 'e.g., The British Library' }],
  "Archival collection/document": [commonFields.authors, commonFields.title, { name: 'documentDate', label: 'Date', placeholder: '', type: 'date' as const }, { name: 'collectionName', label: 'Collection Name', placeholder: 'e.g., John F. Kennedy Papers' }, { name: 'series', label: 'Series/Box/File', placeholder: 'e.g., Box 2, File 10' }, { name: 'repository', label: 'Repository', placeholder: 'e.g., National Archives' }],
  "Lecture notes (unpublished)": [{ name: 'lecturer', label: 'Lecturer', placeholder: 'Name of the lecturer' }, { name: 'courseTitle', label: 'Course/Lecture Title', placeholder: 'e.g., Introduction to Psychology' }, { name: 'institution', label: 'Institution', placeholder: 'e.g., Harvard University' }, { name: 'date', label: 'Date', placeholder: '', type: 'date' as const }],
  "Internal company document": [{ name: 'authorDepartment', label: 'Author/Department', placeholder: 'e.g., Marketing Department' }, commonFields.title, { name: 'documentType', label: 'Document Type', placeholder: 'e.g., Internal memo, Report' }, { name: 'companyName', label: 'Company Name', placeholder: 'e.g., Acme Corporation' }, { name: 'date', label: 'Date', placeholder: '', type: 'date' as const }],

  // Other
  "Standard": [{ name: 'issuingOrganization', label: 'Issuing Organization', placeholder: 'e.g., International Organization for Standardization' }, { name: 'standardNumber', label: 'Standard Number', placeholder: 'e.g., ISO 9001:2015' }, commonFields.title, commonFields.year, { name: 'publisher', label: 'Publisher', placeholder: 'e.g., ISO' }],
  "Patent": [{ name: 'inventors', label: 'Inventor(s)', placeholder: 'e.g., Smith, J.' }, { name: 'patentTitle', label: 'Patent Title', placeholder: 'Title of the patent' }, { name: 'patentNumber', label: 'Patent Number', placeholder: 'e.g., US 1234567 B2' }, { name: 'issueDate', label: 'Issue Date', placeholder: '', type: 'date' as const }, { name: 'office', label: 'Patent Office', placeholder: 'e.g., U.S. Patent and Trademark Office' }, commonFields.url],
  "Map": [{ name: 'cartographer', label: 'Cartographer/Creator', placeholder: 'Name of the map maker' }, commonFields.title, { name: 'mapType', label: 'Type of Map', placeholder: 'e.g., Topographic map, Political map' }, { name: 'scale', label: 'Scale', placeholder: 'e.g., 1:24000' }, { name: 'publisher', label: 'Publisher', placeholder: 'e.g., U.S. Geological Survey' }, commonFields.year],
  "Software/Code": [{ name: 'creator', label: 'Creator/Author', placeholder: 'e.g., Linus Torvalds' }, commonFields.title, { name: 'version', label: 'Version', placeholder: 'e.g., 5.4' }, { name: 'publisher', label: 'Publisher/Sponsor', placeholder: 'e.g., The Linux Foundation' }, commonFields.year, commonFields.url],
  "Data set": [commonFields.authors, commonFields.title, { name: 'version', label: 'Version', placeholder: 'e.g., V2' }, { name: 'publisher', label: 'Publisher/Distributor', placeholder: 'e.g., Zenodo' }, commonFields.year, commonFields.doi, commonFields.url],
};
