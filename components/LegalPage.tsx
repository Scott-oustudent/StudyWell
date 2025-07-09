
import React from 'react';
import Card from './common/Card';
import Icon from './common/Icon';

const LegalPage: React.FC = () => {

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-pink-200 flex items-center">
         <Icon>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         </Icon>
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
  
  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-6">
        Legal Information
      </h1>
      <Card className="p-8 flex-grow overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
            <Section title="Terms and Conditions">
            <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
            <p>Welcome to StudyWell! These terms and conditions outline the rules and regulations for the use of StudyWell's Website, located at studywell.app.</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use StudyWell if you do not agree to take all of the terms and conditions stated on this page.</p>
            <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Netherlands. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>
            <h3 className="font-bold text-lg pt-2">License</h3>
            <p>Unless otherwise stated, StudyWell and/or its licensors own the intellectual property rights for all material on StudyWell. All intellectual property rights are reserved. You may access this from StudyWell for your own personal use subjected to restrictions set in these terms and conditions.</p>
            </Section>

            <Section title="Privacy Policy">
            <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
            <p>Your privacy is important to us. It is StudyWell's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
            <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
            <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
            </Section>
        </div>
        
        <div className="mt-8">
            <Section title="Acceptable Use Policy">
                <p>This Acceptable Use Policy ("AUP") governs your use of the StudyWell services ("Services"). By using the Services, you agree to this AUP.</p>
                <h3 className="font-bold text-lg pt-2">Prohibited Uses</h3>
                <p>You may not use the Services to engage in, foster, or promote illegal, abusive, or irresponsible behavior, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Unauthorized access to or use of data, systems, or networks, including any attempt to probe, scan, or test the vulnerability of a system or network or to breach security or authentication measures without express authorization of the owner of the system or network.</li>
                    <li>Monitoring data or traffic on any network or system without the express authorization of the owner of the system or network.</li>
                    <li>Interference with service to any user, host, or network including, without limitation, mail bombing, flooding, deliberate attempts to overload a system, and broadcast attacks.</li>
                    <li>Use of an account or computer without the owner's authorization.</li>
                    <li>Collecting or using email addresses, screen names, or other identifiers without the consent of the person identified (including, without limitation, phishing, Internet scamming, password robbery, spidering, and harvesting).</li>
                    <li>Submitting content that is academically dishonest, such as plagiarism or cheating. All generated content should be used as a study aid and guide, not as a substitute for your own work.</li>
                </ul>
            </Section>
        </div>
      </Card>
    </div>
  );
};

export default LegalPage;
