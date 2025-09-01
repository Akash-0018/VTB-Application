import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import BookingForm from './BookingForm';

const Dashboard = () => {
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    try {
      const response = await fetch('/api/admin/booking-stats');
      const data = await response.json();
      setBookingStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      setLoading(false);
    }
  };

  const downloadMonthlyReport = async (year, month) => {
    try {
      const response = await fetch(`/api/admin/monthly-report/${year}/${month}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
      const blob = await response.blob();
      saveAs(blob, `booking-report_${year}_${month}.xlsx`);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Bookings</Card.Title>
              <h3>{bookingStats?.totalBookings || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Active Bookings</Card.Title>
              <h3>{bookingStats?.activeBookings || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Revenue This Month</Card.Title>
              <h3>₹{bookingStats?.monthlyRevenue || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Reports */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Monthly Reports</Card.Title>
          <Table responsive>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Bookings</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingStats?.monthlyStats?.map((stat) => (
                <tr key={stat.month}>
                  <td>{stat.month}</td>
                  <td>{stat.bookings}</td>
                  <td>₹{stat.revenue}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => downloadMonthlyReport(stat.month)}
                    >
                      Download Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Image Management */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Turf Images</Card.Title>
          <Row className="g-3">
            {bookingStats?.turfImages?.map((image, index) => (
              <Col md={3} key={index}>
                <Card>
                  <Card.Img variant="top" src={image} />
                  <Card.Body className="text-center">
                    <Button variant="danger" size="sm">Remove</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Booking Form */}
      <Card>
        <Card.Body>
          <Card.Title>New Booking</Card.Title>
          <BookingForm />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
