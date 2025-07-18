
import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const StudentLoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState('10000');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [error, setError] = useState('');

  const [results, setResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    schedule: AmortizationEntry[];
  } | null>(null);

  const handleCalculate = () => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const termYears = parseInt(loanTerm);

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(termYears) || termYears <= 0) {
      setError('Please enter valid, positive numbers for all fields.');
      setResults(null);
      return;
    }

    setError('');
    
    const monthlyRate = annualRate / 100 / 12;
    const n = termYears * 12;
    let M: number;

    if (monthlyRate === 0) {
      M = P / n;
    } else {
      M = P * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    
    const totalCost = M * n;
    const totalInterest = totalCost - P;

    // Generate Amortization Schedule
    const schedule: AmortizationEntry[] = [];
    let balance = P;
    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = M - interestPayment;
      
      // Ensure the last payment clears the balance exactly
      if (i === n || (balance - principalPayment) < 0.01) {
        principalPayment = balance;
        balance = 0;
      } else {
         balance -= principalPayment;
      }
      
      schedule.push({
        month: i,
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance,
      });

      if (balance <= 0) break; // Stop if balance is cleared early
    }

    setResults({
      monthlyPayment: M,
      totalInterest,
      totalCost,
      schedule,
    });
  };

  const InputField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, icon?: React.ReactNode }> = ({ label, value, onChange, type='number', icon}) => (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
           {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{icon}</div>}
           <input
            type={type}
            value={value}
            onChange={onChange}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 ${icon ? 'pl-10' : ''}`}
            />
        </div>
      </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Student Loan Calculator</h1>
      <p className="text-lg text-gray-600 mb-6">Estimate your monthly payments and see the total cost of your loan over time.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Input and Results */}
        <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Loan Details</h2>
                <div className="space-y-4">
                     <InputField 
                        label="Loan Amount" 
                        value={loanAmount} 
                        onChange={e => setLoanAmount(e.target.value)}
                        icon={<span className="text-gray-500">$</span>}
                    />
                    <InputField 
                        label="Annual Interest Rate (%)" 
                        value={interestRate} 
                        onChange={e => setInterestRate(e.target.value)}
                        icon={<span className="text-gray-500">%</span>}
                    />
                    <InputField 
                        label="Loan Term (Years)" 
                        value={loanTerm} 
                        onChange={e => setLoanTerm(e.target.value)}
                         icon={<Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></Icon>}
                    />
                     <Button onClick={handleCalculate} className="w-full">Calculate</Button>
                     {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
            </Card>

            {results && (
                 <Card className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600">Monthly Payment</span>
                            <span className="font-bold text-2xl text-pink-600">{formatCurrency(results.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600">Total Principal</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(parseFloat(loanAmount))}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600">Total Interest</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(results.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t">
                            <span className="font-bold text-gray-800">Total Loan Cost</span>
                            <span className="font-bold text-xl text-gray-900">{formatCurrency(results.totalCost)}</span>
                        </div>
                    </div>
                 </Card>
            )}
        </div>

        {/* Amortization Table */}
        <div className="lg:col-span-2">
            <Card className="p-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Amortization Schedule</h2>
                <div className="flex-grow overflow-y-auto border rounded-lg">
                    {results ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.schedule.map(row => (
                                    <tr key={row.month}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.month}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(row.payment)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{formatCurrency(row.principal)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-700">{formatCurrency(row.interest)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Your results will appear here after calculation.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default StudentLoanCalculator;
