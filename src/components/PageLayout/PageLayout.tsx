import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import classes from "./PageLayout.module.css";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className={classes.pageWrapper}>
      <main className={classes.content}>{children}</main>
      <Footer />
    </div>
  );
}

export default PageLayout;
