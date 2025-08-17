class Observer {
  constructor() {
    this.observers = new Map();
  }

  subscribe(eventType, callback) {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    this.observers.get(eventType).push(callback);
  }

  unsubscribe(eventType, callback) {
    if (this.observers.has(eventType)) {
      const callbacks = this.observers.get(eventType);
      this.observers.set(
        eventType,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  notify(eventType, data) {
    if (this.observers.has(eventType)) {
      this.observers.get(eventType).forEach((callback) => callback(data));
    }
  }
}