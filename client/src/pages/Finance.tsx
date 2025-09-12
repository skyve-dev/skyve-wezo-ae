import React, { useEffect, useState } from 'react'
import { IoCreate, IoCard, IoStatsChart, IoDownload, IoAdd } from 'react-icons/io5'
import { useSelector, useDispatch } from 'react-redux'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'
import { RootState } from '@/store'
import { 
  fetchEarningsStats,
  fetchTransactions,
  fetchBankAccounts,
  fetchPayouts
} from '@/store/slices/financeSlice'

// Finance Component  
const Finance: React.FC = () => {
    const dispatch = useDispatch()
    const {
      stats,
      transactions,
      bankAccounts,
      payouts,
      loading,
      error
    } = useSelector((state: RootState) => state.finance)

    const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'payouts' | 'bank'>('overview')

    useEffect(() => {
      dispatch(fetchEarningsStats(undefined) as any)
      dispatch(fetchTransactions({}) as any)
      dispatch(fetchBankAccounts() as any)
      dispatch(fetchPayouts({}) as any)
    }, [dispatch])

    const formatCurrency = (amount: number, currency = 'AED') => {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    if (loading && !stats) {
      return (
        <SecuredPage>
          <Box padding="2rem" maxWidth="1200px" margin="0 auto">
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
              <Box fontSize="1.125rem" color="#666">Loading financial data...</Box>
            </Box>
          </Box>
        </SecuredPage>
      )
    }

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                {/* Error Message */}
                {error && (
                  <Box 
                    padding="1rem" 
                    backgroundColor="#fee2e2" 
                    border="1px solid #fecaca"
                    borderRadius="8px" 
                    marginBottom="2rem"
                  >
                    <p style={{ color: '#dc2626', fontWeight: '600', margin: 0 }}>
                      {error}
                    </p>
                  </Box>
                )}

                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Finance & Earnings</h1>
                    <p style={{color: '#666'}}>Monitor your earnings and manage financial operations</p>
                </Box>

                {/* Tab Navigation */}
                <Box display="flex" gap="0.5rem" marginBottom="2rem" borderBottom="1px solid #e5e7eb">
                  {[
                    { key: 'overview', label: 'Overview', icon: <IoStatsChart /> },
                    { key: 'transactions', label: 'Transactions', icon: <IoCard /> },
                    { key: 'payouts', label: 'Payouts', icon: <IoDownload /> },
                    { key: 'bank', label: 'Bank Details', icon: <IoCreate /> },
                  ].map((tab) => (
                    <Box
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key as any)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        borderBottom: selectedTab === tab.key ? '2px solid #D52122' : '2px solid transparent',
                        color: selectedTab === tab.key ? '#D52122' : '#666',
                        fontWeight: selectedTab === tab.key ? '600' : '400'
                      }}
                      display="flex"
                      alignItems="center"
                      gap="0.5rem"
                    >
                      {tab.icon}
                      {tab.label}
                    </Box>
                  ))}
                </Box>

                {/* Overview Tab */}
                {selectedTab === 'overview' && (
                  <>
                    {/* Earnings Overview */}
                    <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="1.5rem" marginBottom="2rem">
                        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>This Month</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                              {stats ? formatCurrency(stats.thisMonth.net) : formatCurrency(0)}
                            </p>
                            <small style={{color: '#10b981'}}>
                              +{stats?.thisMonth.growthPercent || 0}% from last month
                            </small>
                        </Box>
                        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>Year to Date</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                              {stats ? formatCurrency(stats.yearToDate.net) : formatCurrency(0)}
                            </p>
                            <small style={{color: '#10b981'}}>
                              +{stats?.yearToDate.growthPercent || 0}% from last year
                            </small>
                        </Box>
                        <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <h3 style={{fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#666'}}>Pending Payout</h3>
                            <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>
                              {stats ? formatCurrency(stats.pendingPayout.amount) : formatCurrency(0)}
                            </p>
                            <small style={{color: '#666'}}>
                              Next payout: {stats?.pendingPayout.nextPayoutDate 
                                ? formatDate(stats.pendingPayout.nextPayoutDate)
                                : 'TBD'}
                            </small>
                        </Box>
                    </Box>

                    {/* Recent Transactions */}
                    <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" marginBottom="2rem">
                        <h3 style={{marginBottom: '1.5rem'}}>Recent Transactions</h3>
                        <Box display="grid" gap="1rem">
                            {transactions.slice(0, 5).map((transaction) => (
                                <Box key={transaction.id} display="flex" justifyContent="space-between" padding="1rem" backgroundColor="#f9fafb" borderRadius="4px">
                                    <Box>
                                        <p style={{margin: '0 0 0.25rem 0', fontWeight: '500'}}>{transaction.description}</p>
                                        <small style={{color: '#666'}}>{formatDate(transaction.createdAt)}</small>
                                        {transaction.guestName && <small style={{color: '#666', display: 'block'}}>{transaction.guestName}</small>}
                                    </Box>
                                    <Box textAlign="right">
                                        <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: '#10b981'}}>
                                            {formatCurrency(transaction.netAmount)}
                                        </p>
                                        <small style={{color: '#666'}}>
                                          {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                                        </small>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box marginTop="1.5rem">
                            <Button 
                              label="View All Transactions" 
                              variant="normal" 
                              onClick={() => setSelectedTab('transactions')} 
                            />
                        </Box>
                    </Box>
                  </>
                )}

                {/* Transactions Tab */}
                {selectedTab === 'transactions' && (
                  <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" marginBottom="2rem">
                    <h3 style={{marginBottom: '1.5rem'}}>All Transactions</h3>
                    <Box display="grid" gap="1rem">
                      {transactions.map((transaction) => (
                        <Box key={transaction.id} display="flex" justifyContent="space-between" padding="1rem" backgroundColor="#f9fafb" borderRadius="4px">
                          <Box>
                            <p style={{margin: '0 0 0.25rem 0', fontWeight: '500'}}>{transaction.description}</p>
                            <small style={{color: '#666'}}>{formatDate(transaction.createdAt)}</small>
                            {transaction.guestName && <small style={{color: '#666', display: 'block'}}>{transaction.guestName}</small>}
                            {transaction.bookingReference && <small style={{color: '#666', display: 'block'}}>Ref: {transaction.bookingReference}</small>}
                          </Box>
                          <Box textAlign="right">
                            <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: '#10b981'}}>
                              {formatCurrency(transaction.netAmount)}
                            </p>
                            <small style={{color: '#666'}}>{transaction.status === 'completed' ? 'Completed' : 'Pending'}</small>
                            {transaction.commissionRate && transaction.commissionRate > 0 && (
                              <small style={{color: '#666', display: 'block'}}>Commission: {transaction.commissionRate.toFixed(1)}%</small>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Payouts Tab */}
                {selectedTab === 'payouts' && (
                  <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" marginBottom="2rem">
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
                      <h3 style={{margin: 0}}>Payouts</h3>
                      <Button label="Request Payout" icon={<IoDownload />} variant="promoted" />
                    </Box>
                    <Box display="grid" gap="1rem">
                      {payouts.length > 0 ? payouts.map((payout) => (
                        <Box key={payout.id} display="flex" justifyContent="space-between" padding="1rem" backgroundColor="#f9fafb" borderRadius="4px">
                          <Box>
                            <p style={{margin: '0 0 0.25rem 0', fontWeight: '500'}}>Payout #{payout.reference}</p>
                            <small style={{color: '#666'}}>
                              Scheduled: {payout.scheduledDate ? formatDate(payout.scheduledDate) : 'TBD'}
                            </small>
                            {payout.processedDate && <small style={{color: '#666', display: 'block'}}>Processed: {formatDate(payout.processedDate)}</small>}
                          </Box>
                          <Box textAlign="right">
                            <p style={{margin: '0 0 0.25rem 0', fontWeight: '600', color: '#10b981'}}>
                              {formatCurrency(payout.amount)}
                            </p>
                            <small style={{
                              color: payout.status === 'completed' ? '#10b981' : 
                                     payout.status === 'failed' ? '#ef4444' : '#f59e0b',
                              textTransform: 'capitalize'
                            }}>
                              {payout.status}
                            </small>
                          </Box>
                        </Box>
                      )) : (
                        <Box textAlign="center" padding="2rem" color="#666">
                          <p>No payouts yet. Complete bookings to see payouts here.</p>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Bank Details Tab */}
                {selectedTab === 'bank' && (
                  <Box padding="2rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)" marginBottom="2rem">
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1.5rem">
                      <h3 style={{margin: 0}}>Bank Account Details</h3>
                      <Button label="Add Bank Account" icon={<IoAdd />} variant="promoted" />
                    </Box>
                    
                    {bankAccounts.length > 0 ? bankAccounts.map((account) => (
                      <Box key={account.id} padding="1.5rem" backgroundColor="#f9fafb" borderRadius="8px" marginBottom="1rem">
                        <Box display="grid" gap="1rem">
                          <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Account Holder</label>
                            <p style={{margin: 0, fontWeight: '500'}}>{account.accountHolderName}</p>
                          </Box>
                          <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Bank Name</label>
                            <p style={{margin: 0, fontWeight: '500'}}>{account.bankName}</p>
                          </Box>
                          <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>IBAN</label>
                            <p style={{margin: 0, fontWeight: '500'}}>{account.iban}</p>
                          </Box>
                          <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Currency</label>
                            <p style={{margin: 0, fontWeight: '500'}}>{account.currency}</p>
                          </Box>
                          <Box>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem'}}>Status</label>
                            <p style={{margin: 0, fontWeight: '500', color: account.isVerified ? '#10b981' : '#f59e0b'}}>
                              {account.isVerified ? 'Verified' : 'Pending Verification'}
                            </p>
                          </Box>
                        </Box>
                        <Box marginTop="1.5rem" display="flex" gap="1rem">
                          <Button label="Edit" icon={<IoCreate />} variant="normal" size="small" />
                          {!account.isVerified && (
                            <Button label="Verify" variant="promoted" size="small" />
                          )}
                        </Box>
                      </Box>
                    )) : (
                      <Box textAlign="center" padding="2rem" color="#666">
                        <p>No bank accounts configured. Add a bank account to receive payouts.</p>
                      </Box>
                    )}
                  </Box>
                )}
            </Box>
        </SecuredPage>
    )
}

export default Finance