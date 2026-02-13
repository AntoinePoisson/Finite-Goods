package application

import (
	"errors"
	"fmt"

	"github.com/AntoinePoisson/finite-goods/engine/domain"
)

type Result struct {
	World domain.World `json:"world"`
	Code  string       `json:"code,omitempty"`
	Error string       `json:"error,omitempty"`
}

func Apply(world domain.World, command domain.Command) Result {
	if command.EventID == "" || command.Now.IsZero() {
		return failure(world, domain.ErrMissingIdentifier)
	}

	// Successful event IDs are replay-safe.
	if hasEvent(world, command.EventID) {
		return Result{World: world}
	}

	var err error
	switch command.Type {
	case domain.ReserveObject:
		err = reserve(&world, command)
	case domain.BeginPayment:
		err = beginPayment(&world, command)
	case domain.ReturnFromCheckout:
		err = returnFromCheckout(&world, command)
	case domain.ConfirmPayment:
		err = confirmPayment(&world, command)
	case domain.ExpireReservation:
		err = expireReservation(&world, command)
	case domain.RefundOrder:
		err = refundOrder(&world, command)
	default:
		err = domain.ErrInvalidCommand
	}

	if err != nil {
		return failure(world, err)
	}

	world.Version++
	return Result{World: world}
}

func reserve(world *domain.World, command domain.Command) error {
	if command.ObjectID == "" || command.OrderID == "" || command.Customer.Email == "" || command.Customer.Name == "" || command.ExpiresAt.Before(command.Now) {
		return domain.ErrMissingIdentifier
	}

	object, err := objectByID(world, command.ObjectID)
	if err != nil {
		return err
	}
	if object.Status != domain.ObjectAvailable {
		return domain.ErrObjectUnavailable
	}

	object.Status = domain.ObjectReserved
	object.ReservationID = command.OrderID
	object.Version++
	world.Orders = append(world.Orders, domain.Order{
		ID:                   command.OrderID,
		ObjectID:             command.ObjectID,
		Status:               domain.OrderReserved,
		CreatedAt:            command.Now,
		ReservationExpiresAt: command.ExpiresAt,
		Customer:             command.Customer,
		Version:              1,
	})
	appendEvent(world, command, "OBJECT_RESERVED", map[string]any{
		"customerName":  command.Customer.Name,
		"customerEmail": command.Customer.Email,
		"country":       command.Customer.Country,
	})
	return nil
}

func beginPayment(world *domain.World, command domain.Command) error {
	order, object, err := activeOrder(world, command)
	if err != nil {
		return err
	}
	if command.Now.After(order.ReservationExpiresAt) {
		return expire(world, object, order, command)
	}
	if order.Status != domain.OrderReserved {
		return domain.ErrInvalidTransition
	}

	order.Status = domain.OrderPaymentPending
	order.Version++
	command.ObjectID = order.ObjectID
	appendEvent(world, command, "PAYMENT_STARTED", nil)
	return nil
}

func returnFromCheckout(world *domain.World, command domain.Command) error {
	order, _, err := activeOrder(world, command)
	if err != nil {
		return err
	}
	if order.Status != domain.OrderPaymentPending {
		return domain.ErrInvalidTransition
	}
	if command.Now.After(order.ReservationExpiresAt) {
		return domain.ErrReservationExpired
	}

	// A return URL is not payment evidence.
	order.Status = domain.OrderUnverifiedReturn
	order.Version++
	command.ObjectID = order.ObjectID
	appendEvent(world, command, "CHECKOUT_RETURNED", map[string]any{"verified": false})
	return nil
}

func confirmPayment(world *domain.World, command domain.Command) error {
	order, object, err := activeOrder(world, command)
	if err != nil {
		return err
	}
	if order.Status == domain.OrderPaid {
		return nil
	}
	if order.Status != domain.OrderPaymentPending && order.Status != domain.OrderUnverifiedReturn {
		return domain.ErrInvalidTransition
	}
	if command.Now.After(order.ReservationExpiresAt) {
		return domain.ErrReservationExpired
	}

	// Only this command can consume the held object.
	order.Status = domain.OrderPaid
	order.PaymentReference = command.PaymentReference
	order.Version++
	object.Status = domain.ObjectSold
	object.ReservationID = ""
	object.Version++
	command.ObjectID = order.ObjectID
	appendEvent(world, command, "PAYMENT_CONFIRMED", nil)
	return nil
}

func expireReservation(world *domain.World, command domain.Command) error {
	order, object, err := activeOrder(world, command)
	if err != nil {
		return err
	}
	if command.Now.Before(order.ReservationExpiresAt) {
		return domain.ErrInvalidTransition
	}
	return expire(world, object, order, command)
}

func expire(world *domain.World, object *domain.Object, order *domain.Order, command domain.Command) error {
	if order.Status != domain.OrderReserved && order.Status != domain.OrderPaymentPending && order.Status != domain.OrderUnverifiedReturn {
		return domain.ErrInvalidTransition
	}

	order.Status = domain.OrderExpired
	order.Version++
	object.Status = domain.ObjectAvailable
	object.ReservationID = ""
	object.Version++
	command.ObjectID = order.ObjectID
	appendEvent(world, command, "RESERVATION_EXPIRED", nil)
	return nil
}

func refundOrder(world *domain.World, command domain.Command) error {
	order, object, err := activeOrder(world, command)
	if err != nil {
		return err
	}
	if order.Status != domain.OrderPaid {
		return domain.ErrInvalidTransition
	}

	order.Status = domain.OrderRefunded
	order.Version++
	object.Status = domain.ObjectAvailable
	object.ReservationID = ""
	object.Version++
	command.ObjectID = order.ObjectID
	appendEvent(world, command, "ORDER_REFUNDED", nil)
	return nil
}

func activeOrder(world *domain.World, command domain.Command) (*domain.Order, *domain.Object, error) {
	order, err := orderByID(world, command.OrderID)
	if err != nil {
		return nil, nil, err
	}
	object, err := objectByID(world, order.ObjectID)
	if err != nil {
		return nil, nil, err
	}
	return order, object, nil
}

func objectByID(world *domain.World, id string) (*domain.Object, error) {
	for index := range world.Objects {
		if world.Objects[index].ID == id {
			return &world.Objects[index], nil
		}
	}
	return nil, domain.ErrObjectNotFound
}

func orderByID(world *domain.World, id string) (*domain.Order, error) {
	for index := range world.Orders {
		if world.Orders[index].ID == id {
			return &world.Orders[index], nil
		}
	}
	return nil, domain.ErrOrderNotFound
}

func appendEvent(world *domain.World, command domain.Command, eventType string, data map[string]any) {
	world.Events = append(world.Events, domain.Event{
		ID:        command.EventID,
		Type:      eventType,
		ObjectID:  command.ObjectID,
		OrderID:   command.OrderID,
		CreatedAt: command.Now,
		Data:      data,
	})
}

func hasEvent(world domain.World, id string) bool {
	for _, event := range world.Events {
		if event.ID == id {
			return true
		}
	}
	return false
}

func failure(world domain.World, err error) Result {
	code := "INTERNAL_ERROR"
	switch {
	case errors.Is(err, domain.ErrObjectNotFound):
		code = "OBJECT_NOT_FOUND"
	case errors.Is(err, domain.ErrOrderNotFound):
		code = "ORDER_NOT_FOUND"
	case errors.Is(err, domain.ErrObjectUnavailable):
		code = "OBJECT_UNAVAILABLE"
	case errors.Is(err, domain.ErrReservationExpired):
		code = "RESERVATION_EXPIRED"
	case errors.Is(err, domain.ErrInvalidTransition):
		code = "INVALID_TRANSITION"
	case errors.Is(err, domain.ErrInvalidCommand), errors.Is(err, domain.ErrMissingIdentifier):
		code = "INVALID_COMMAND"
	}
	return Result{World: world, Code: code, Error: fmt.Sprintf("%s", err)}
}
