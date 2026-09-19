import UIKit
import SwiftUI

public class DynamicIslandOverlayController {
    public static let shared = DynamicIslandOverlayController()

    private var overlayWindow: PassThroughWindow?
    private var hostingController: UIHostingController<DynamicIslandNotificationContainerView>?
    private let viewModel = DynamicIslandNotificationViewModel()
    private var dismissTimer: Timer?

    private var activePayload: [String: Any]?
    private var onPressCallback: (() -> Void)?
    private var onDismissCallback: (() -> Void)?

    private init() {}

    @MainActor
    public func show(
        payload: [String: Any],
        onPress: @escaping () -> Void,
        onDismiss: @escaping () -> Void
    ) {
        self.activePayload = payload
        self.onPressCallback = onPress
        self.onDismissCallback = onDismiss

        dismissTimer?.invalidate()
        dismissTimer = nil

        // Disparo de feedback tátil suave
        let feedback = UIImpactFeedbackGenerator(style: .medium)
        feedback.impactOccurred()

        let duration = payload["duration"] as? Double ?? 3500

        viewModel.configure(
            payload: payload,
            onPress: { [weak self] in
                self?.onPressCallback?()
            },
            onDismissCompleted: { [weak self] in
                self?.finalizeDismiss()
            }
        )

        if overlayWindow == nil {
            setupOverlayWindow()
        }

        let container = DynamicIslandNotificationContainerView(viewModel: viewModel)

        if let hostingController = hostingController {
            hostingController.rootView = container
        } else if let window = overlayWindow {
            let controller = UIHostingController(rootView: container)
            controller.view.backgroundColor = .clear
            window.rootViewController = controller
            self.hostingController = controller
        }

        overlayWindow?.isHidden = false

        if duration > 0 {
            dismissTimer = Timer.scheduledTimer(withTimeInterval: duration / 1000.0, repeats: false) { [weak self] _ in
                DispatchQueue.main.async {
                    self?.dismiss()
                }
            }
        }
    }

    @MainActor
    public func dismiss() {
        dismissTimer?.invalidate()
        dismissTimer = nil

        viewModel.triggerDismiss()
    }

    @MainActor
    private func finalizeDismiss() {
        self.overlayWindow?.isHidden = true
        self.onDismissCallback?()
        self.activePayload = nil
        self.onPressCallback = nil
        self.onDismissCallback = nil
    }

    @MainActor
    private func setupOverlayWindow() {
        guard let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive || $0.activationState == .foregroundInactive }) else {
            return
        }

        let window = PassThroughWindow(windowScene: windowScene)
        window.windowLevel = .statusBar + 1
        window.backgroundColor = .clear
        window.isUserInteractionEnabled = true
        self.overlayWindow = window
    }
}

// Janela que permite toques passarem através dela quando não clicados na notificação
final class PassThroughWindow: UIWindow {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard let hitView = super.hitTest(point, with: event) else { return nil }
        // Se o toque foi no fundo transparente do rootViewController, passa adiante para o app
        if hitView == rootViewController?.view {
            return nil
        }
        return hitView
    }
}
