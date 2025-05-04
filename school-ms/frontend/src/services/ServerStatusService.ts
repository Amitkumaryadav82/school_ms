import { useState, useEffect } from 'react';

/**
 * Service for monitoring the backend server status.
 * Logs issues to console instead of displaying them in UI.
 */
export class ServerStatusService {
    private static instance: ServerStatusService;
    private statusUrl: string;
    private pollingInterval: number;
    private statusListeners: Array<(status: ServerStatus) => void> = [];
    private currentStatus: ServerStatus = { status: 'UNKNOWN', message: 'Checking server status...' };
    private pollingTimerId: NodeJS.Timeout | null = null;

    /**
     * Creates a new ServerStatusService instance.
     * 
     * @param baseUrl The base URL of the API server
     * @param pollingInterval The interval (in ms) to check server status
     */
    private constructor(baseUrl: string = '/actuator/health', pollingInterval: number = 60000) {
        this.statusUrl = baseUrl;
        this.pollingInterval = pollingInterval;
    }

    /**
     * Get the singleton instance of the ServerStatusService.
     */
    public static getInstance(): ServerStatusService {
        if (!ServerStatusService.instance) {
            ServerStatusService.instance = new ServerStatusService();
        }
        return ServerStatusService.instance;
    }

    /**
     * Start polling the server status.
     */
    public startPolling(): void {
        if (this.pollingTimerId) {
            return; // Already polling
        }

        // Check immediately
        this.checkServerStatus();

        // Then set up interval
        this.pollingTimerId = setInterval(() => {
            this.checkServerStatus();
        }, this.pollingInterval);
    }

    /**
     * Stop polling the server status.
     */
    public stopPolling(): void {
        if (this.pollingTimerId) {
            clearInterval(this.pollingTimerId);
            this.pollingTimerId = null;
        }
    }

    /**
     * Register a listener for server status changes.
     * 
     * @param listener Function to be called when server status changes
     * @returns Function to unregister the listener
     */
    public addStatusListener(listener: (status: ServerStatus) => void): () => void {
        this.statusListeners.push(listener);
        
        // Immediately notify with current status
        listener(this.currentStatus);
        
        // Return function to remove the listener
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    /**
     * Check the current server status.
     */
    private async checkServerStatus(): Promise<void> {
        try {
            const response = await fetch(this.statusUrl);
            
            if (response.ok) {
                // Check content type to avoid parsing HTML as JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.warn('Server returned non-JSON response:', contentType);
                    this.updateStatus({
                        status: 'ONLINE', // Still consider server online, just log the issue
                        message: 'Server is online but returned non-JSON response',
                        details: { contentType }
                    });
                    return;
                }

                try {
                    const data = await response.json();
                    
                    if (data.status === 'UP') {
                        this.updateStatus({
                            status: 'ONLINE',
                            message: 'Server is online',
                            details: data
                        });
                    } else {
                        // Log degraded status to console
                        console.warn(`Server status degraded: ${data.status}`, data);
                        this.updateStatus({
                            status: 'DEGRADED',
                            message: `Server is experiencing issues: ${data.status}`,
                            details: data
                        });
                    }
                } catch (parseError) {
                    console.warn('Error parsing JSON response:', parseError);
                    this.updateStatus({
                        status: 'ONLINE', // Still consider server online
                        message: 'Server is online but returned invalid JSON',
                        error: parseError
                    });
                }
            } else {
                // Log error status to console
                console.error(`Server error: ${response.status} ${response.statusText}`);
                this.updateStatus({
                    status: 'ERROR',
                    message: `Server error: ${response.status} ${response.statusText}`
                });
            }
        } catch (error) {
            // Log connection error to console
            console.error('Cannot connect to server:', error);
            this.updateStatus({
                status: 'OFFLINE',
                message: 'Cannot connect to server',
                error
            });
            
            // Add timestamp to log
            const now = new Date();
            console.log(`Connectivity issue logged at: ${now.toLocaleString()}`);
        }
    }

    /**
     * Update the current status and notify all listeners.
     */
    private updateStatus(newStatus: ServerStatus): void {
        // Track status transition for logging purposes
        const previousStatus = this.currentStatus.status;
        if (previousStatus !== newStatus.status) {
            console.log(`Server status changed from ${previousStatus} to ${newStatus.status}`);
        }
        
        this.currentStatus = newStatus;
        this.notifyListeners();
    }

    /**
     * Notify all listeners of the current status.
     */
    private notifyListeners(): void {
        this.statusListeners.forEach(listener => {
            listener(this.currentStatus);
        });
    }
}

/**
 * React hook to use the ServerStatusService
 */
export function useServerStatus(): ServerStatus {
    const [status, setStatus] = useState<ServerStatus>({
        status: 'UNKNOWN',
        message: 'Initializing...'
    });

    useEffect(() => {
        const service = ServerStatusService.getInstance();
        const unsubscribe = service.addStatusListener(setStatus);
        service.startPolling();
        
        return () => {
            unsubscribe();
            service.stopPolling();
        };
    }, []);

    return status;
}

/**
 * Type definition for server status information
 */
export interface ServerStatus {
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN' | 'ERROR';
    message: string;
    details?: any;
    error?: any;
}