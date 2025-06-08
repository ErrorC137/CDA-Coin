"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Copy, Download } from "lucide-react"

interface QRCodeGeneratorProps {
  balance: string
  address: string
}

export function QRCodeGenerator({ balance, address }: QRCodeGeneratorProps) {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [qrData, setQrData] = useState("")
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const generateQR = () => {
    if (!amount || !recipient) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient address",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) > Number.parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough CDA tokens",
        variant: "destructive",
      })
      return
    }

    // Generate QR code data (in production, this would be a proper payment URI)
    const qrPayload = {
      type: "cda_transfer",
      from: address,
      to: recipient,
      amount: amount,
      timestamp: Date.now(),
    }

    setQrData(JSON.stringify(qrPayload))
    setShowQR(true)

    toast({
      title: "QR Code Generated! 📱",
      description: "Share this QR code to send tokens",
    })
  }

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData)
    toast({
      title: "Copied!",
      description: "QR data copied to clipboard",
    })
  }

  const downloadQR = () => {
    // In production, this would generate and download an actual QR code image
    const blob = new Blob([qrData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cda-transfer-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "QR code data downloaded",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-20 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white">
          <div className="text-center">
            <QrCode className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Send QR</span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            Send CDA via QR Code
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Generate a QR code to send CDA tokens to another user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showQR ? (
            <>
              {/* Balance Display */}
              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <div className="text-center">
                  <p className="text-sm text-gray-300">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-400">{balance} CDA</p>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Send</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  max={balance}
                />
              </div>

              {/* Recipient Input */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateQR}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
            </>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="text-center space-y-4">
                <div className="p-8 bg-white rounded-lg mx-auto w-fit">
                  {/* In production, this would be an actual QR code */}
                  <div className="w-48 h-48 bg-black flex items-center justify-center text-white text-xs p-4">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p>QR Code</p>
                      <p className="text-xs mt-2">Scan to receive</p>
                      <p className="text-xs">{amount} CDA</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-blue-400 font-bold">{amount} CDA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">To:</span>
                    <span className="text-white font-mono text-xs">
                      {recipient.slice(0, 6)}...{recipient.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQRData}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQR}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>

                {/* Reset Button */}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowQR(false)
                    setAmount("")
                    setRecipient("")
                    setQrData("")
                  }}
                  className="w-full"
                >
                  Create New QR Code
                </Button>
              </div>
            </>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-400 text-center">
            💡 The recipient can scan this QR code to claim the tokens
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
