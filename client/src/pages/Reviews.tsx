import React from 'react'
import { FaStar, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa'
import { SecuredPage } from '@/components/SecuredPage.tsx'
import { Box } from '@/components'
import Button from '@/components/base/Button.tsx'

// Reviews Component
const Reviews: React.FC = () => {
    const reviews = [
        {id: 1, guest: "John Smith", property: "Luxury Villa Marina", rating: 5, date: "Jan 10, 2025", comment: "Amazing property with stunning views!", responded: false},
        {id: 2, guest: "Sarah Johnson", property: "Beach House JBR", rating: 4, date: "Jan 5, 2025", comment: "Great location, very clean.", responded: true}
    ]

    return (
        <SecuredPage>
            <Box padding="2rem" maxWidth="1200px" margin="0 auto">
                <Box marginBottom="2rem">
                    <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Guest Reviews</h1>
                    <p style={{color: '#666'}}>View and respond to guest reviews</p>
                </Box>

                {/* Overall Stats */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="1rem" marginBottom="2rem">
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaStar style={{color: '#f59e0b', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Average Rating</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>4.8</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaClipboardList style={{color: '#6366f1', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Total Reviews</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>47</p>
                    </Box>
                    <Box padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                        <Box display="flex" alignItems="center" marginBottom="0.5rem">
                            <FaExclamationTriangle style={{color: '#ef4444', marginRight: '0.5rem'}} />
                            <span style={{fontWeight: '600'}}>Pending Responses</span>
                        </Box>
                        <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>4</p>
                    </Box>
                </Box>

                {/* Reviews List */}
                <Box display="grid" gap="1rem">
                    {reviews.map(review => (
                        <Box key={review.id} padding="1.5rem" backgroundColor="white" borderRadius="8px" boxShadow="0 2px 4px rgba(0,0,0,0.1)">
                            <Box display="flex" justifyContent="space-between" marginBottom="1rem">
                                <Box>
                                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.25rem 0'}}>{review.guest}</h3>
                                    <p style={{color: '#666', margin: 0, fontSize: '0.875rem'}}>{review.property} • {review.date}</p>
                                </Box>
                                <Box display="flex" gap="0.25rem">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} style={{color: i < review.rating ? '#f59e0b' : '#d1d5db'}} />
                                    ))}
                                </Box>
                            </Box>
                            <p style={{margin: '0 0 1rem 0'}}>{review.comment}</p>
                            {!review.responded && (
                                <Box>
                                    <textarea 
                                        placeholder="Write your response..." 
                                        rows={2} 
                                        style={{width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '0.5rem'}}
                                    />
                                    <Button label="Post Response" size="small" variant="promoted" />
                                </Box>
                            )}
                            {review.responded && (
                                <Box padding="1rem" backgroundColor="#f9fafb" borderRadius="4px">
                                    <small style={{color: '#666'}}>Your response:</small>
                                    <p style={{margin: '0.25rem 0 0 0'}}>Thank you for your kind words! We're glad you enjoyed your stay.</p>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </SecuredPage>
    )
}

export default Reviews