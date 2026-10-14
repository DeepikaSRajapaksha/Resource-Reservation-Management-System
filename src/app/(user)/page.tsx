import Link from "next/link";
import styles from "@/styles/UserHome/UserHome.module.css";
import UserNavbar from "@/components/layout/UserNavbar";

export default function UserHomePage() {
  return (
    <>

    <UserNavbar/>

    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.content}>
          <span className={styles.tag}>RESOURCE RESERVATION SYSTEM</span>

          <h1>
            Find the right resource.
            <br />
            <span>Book it with ease.</span>
          </h1>

          <p>
            Explore available resources, check dates and times,
            and submit your reservation request in a few simple steps.
          </p>

          <div className={styles.actions}>
            <Link href="/resources" className={styles.primaryButton}>
              Explore Resources
            </Link>

            <Link href="/reservations" className={styles.secondaryButton}>
              My Reservations
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.icon}>▦</div>
          <h2>ResourceHub</h2>
          <p>One place to manage your bookings.</p>

          <div className={styles.feature}>
            <span>✓</span>
            Check resource availability
          </div>
          <div className={styles.feature}>
            <span>✓</span>
            Choose your preferred time
          </div>
          <div className={styles.feature}>
            <span>✓</span>
            Submit reservation requests
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <h2>How it works</h2>
        <div className={styles.stepGrid}>
          <article className={styles.step}>
            <span>01</span>
            <h3>Choose a time</h3>
            <p>Select the start and end date and time you need.</p>
          </article>

          <article className={styles.step}>
            <span>02</span>
            <h3>Find a resource</h3>
            <p>See which resources are available for your selected period.</p>
          </article>

          <article className={styles.step}>
            <span>03</span>
            <h3>Send your request</h3>
            <p>Choose a resource and submit your reservation details.</p>
          </article>
        </div>
      </section>
    </main>
    </>
  );
}
