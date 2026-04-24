import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import NewDocumentButton from "./NewDocumentButton"
import { MenuIcon } from "lucide-react"

function Sidebar() {
    const menuOptions = (
        <>
            <NewDocumentButton />
            
            {/* Rest of sidebar components */}
        </>
    )
  return (
    <div className="p-2 md:p-5 bg-gray-200 relative">
        <div className="md:hidden">
        <Sheet>
            <SheetTrigger>
                <MenuIcon className="p-2 "/>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <div>
                    {menuOptions}
                </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
        </div>

        <div className="hidden md:inline">
            {menuOptions}
        </div>
    </div>
  )
}
export default Sidebar