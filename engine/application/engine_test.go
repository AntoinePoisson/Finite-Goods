package application_test

import (
	"testing"
	"time"

	"github.com/AntoinePoisson/finite-goods/engine/application"
	"github.com/AntoinePoisson/finite-goods/engine/domain"
)

func TestOnlyOneReservationWins(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	world := testWorld()
	first := application.Apply(world, reserveCommand("order-one", "event-one", now))
	second := application.Apply(first.World, reserveCommand("order-two", "event-two", now))

	if first.Error != "" {
		t.Fatalf("first reservation failed: %s", first.Error)
	}
	if second.Code != "OBJECT_UNAVAILABLE" {
		t.Fatalf("expected conflict, got %q", second.Code)
	}
	if len(second.World.Orders) != 1 {
		t.Fatalf("expected one order, got %d", len(second.World.Orders))
	}
}

func TestPaymentConfirmationIsIdempotent(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	reserved := application.Apply(testWorld(), reserveCommand("order-one", "event-one", now))
	started := application.Apply(reserved.World, domain.Command{
		Type: domain.BeginPayment, OrderID: "order-one", EventID: "event-two", Now: now.Add(time.Minute),
	})
	confirmed := application.Apply(started.World, domain.Command{
		Type: domain.ConfirmPayment, OrderID: "order-one", EventID: "payment-event", Now: now.Add(2 * time.Minute),
	})
	again := application.Apply(confirmed.World, domain.Command{
		Type: domain.ConfirmPayment, OrderID: "order-one", EventID: "payment-event", Now: now.Add(3 * time.Minute),
	})

	if again.Error != "" {
		t.Fatalf("idempotent command failed: %s", again.Error)
	}
	if len(again.World.Events) != 3 {
		t.Fatalf("expected duplicate event to be ignored, got %d events", len(again.World.Events))
	}
	if again.World.Objects[0].Status != domain.ObjectSold {
		t.Fatalf("expected sold object, got %s", again.World.Objects[0].Status)
	}
}

func TestCheckoutReturnDoesNotConfirmPayment(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	reserved := application.Apply(testWorld(), reserveCommand("order-one", "event-one", now))
	started := application.Apply(reserved.World, domain.Command{
		Type: domain.BeginPayment, OrderID: "order-one", EventID: "event-two", Now: now.Add(time.Minute),
	})
	returned := application.Apply(started.World, domain.Command{
		Type: domain.ReturnFromCheckout, OrderID: "order-one", EventID: "event-three", Now: now.Add(2 * time.Minute),
	})

	if returned.World.Orders[0].Status != domain.OrderUnverifiedReturn {
		t.Fatalf("expected unverified return, got %s", returned.World.Orders[0].Status)
	}
	if returned.World.Objects[0].Status != domain.ObjectReserved {
		t.Fatalf("checkout return sold the object")
	}
}

func TestExpiredReservationReleasesObject(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	reserved := application.Apply(testWorld(), reserveCommand("order-one", "event-one", now))
	expired := application.Apply(reserved.World, domain.Command{
		Type: domain.ExpireReservation, OrderID: "order-one", EventID: "event-two", Now: now.Add(6 * time.Minute),
	})

	if expired.Error != "" {
		t.Fatalf("expiration failed: %s", expired.Error)
	}
	if expired.World.Objects[0].Status != domain.ObjectAvailable {
		t.Fatalf("expected available object, got %s", expired.World.Objects[0].Status)
	}
	if expired.World.Orders[0].Status != domain.OrderExpired {
		t.Fatalf("expected expired order, got %s", expired.World.Orders[0].Status)
	}
}

func TestExpiredReservationCannotBePaid(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	reserved := application.Apply(testWorld(), reserveCommand("order-one", "event-one", now))
	started := application.Apply(reserved.World, domain.Command{
		Type: domain.BeginPayment, OrderID: "order-one", EventID: "event-two", Now: now.Add(time.Minute),
	})
	confirmed := application.Apply(started.World, domain.Command{
		Type: domain.ConfirmPayment, OrderID: "order-one", EventID: "event-three", Now: now.Add(6 * time.Minute),
	})

	if confirmed.Code != "RESERVATION_EXPIRED" {
		t.Fatalf("expected expired reservation error, got %q", confirmed.Code)
	}
	if confirmed.World.Objects[0].Status == domain.ObjectSold {
		t.Fatal("expired reservation was sold")
	}
}

func testWorld() domain.World {
	return domain.World{Objects: []domain.Object{{ID: "stone", Status: domain.ObjectAvailable, Version: 1}}, Version: 1}
}

func reserveCommand(orderID, eventID string, now time.Time) domain.Command {
	return domain.Command{
		Type: domain.ReserveObject, ObjectID: "stone", OrderID: orderID, EventID: eventID,
		Now: now, ExpiresAt: now.Add(5 * time.Minute),
		Customer: domain.Customer{Name: "Demo Owner", Email: "demo@example.com", Country: "France"},
	}
}
