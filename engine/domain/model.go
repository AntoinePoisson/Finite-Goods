package domain

import "time"

type ObjectStatus string

const (
	ObjectAvailable ObjectStatus = "AVAILABLE"
	ObjectReserved  ObjectStatus = "RESERVED"
	ObjectSold      ObjectStatus = "SOLD"
)

type OrderStatus string

const (
	OrderReserved         OrderStatus = "RESERVED"
	OrderPaymentPending   OrderStatus = "PAYMENT_PENDING"
	OrderUnverifiedReturn OrderStatus = "UNVERIFIED_RETURN"
	OrderPaid             OrderStatus = "PAID"
	OrderExpired          OrderStatus = "EXPIRED"
	OrderRefunded         OrderStatus = "REFUNDED"
)

type Object struct {
	ID            string       `json:"id"`
	Status        ObjectStatus `json:"status"`
	Version       int          `json:"version"`
	ReservationID string       `json:"reservationId,omitempty"`
}

type Customer struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Country string `json:"country"`
}

type Order struct {
	ID                   string      `json:"id"`
	ObjectID             string      `json:"objectId"`
	Status               OrderStatus `json:"status"`
	CreatedAt            time.Time   `json:"createdAt"`
	ReservationExpiresAt time.Time   `json:"reservationExpiresAt"`
	Customer             Customer    `json:"customer"`
	PaymentReference     string      `json:"paymentReference,omitempty"`
	Version              int         `json:"version"`
}

type Event struct {
	ID        string         `json:"id"`
	Type      string         `json:"type"`
	ObjectID  string         `json:"objectId,omitempty"`
	OrderID   string         `json:"orderId,omitempty"`
	CreatedAt time.Time      `json:"createdAt"`
	Data      map[string]any `json:"data,omitempty"`
}

type World struct {
	Objects []Object `json:"objects"`
	Orders  []Order  `json:"orders"`
	Events  []Event  `json:"events"`
	Version int      `json:"version"`
}
